import { ruleCache } from "../..";
import pool from "../database/db";
import logger from "../logger";
import RuleCache from "./RuleCache";

type Rule = {
  messages: number;
  slowmode: number;
  notify: boolean;
  interval: number;
};

export const serverCache = new Map<string, Server>();

export default class Server {
  public id: string;
  public channels: undefined | string[];
  public rules: Map<
    string,
    {
      id: number;
      messages: number;
      slowmode: number;
      notify: boolean;
      interval: number;
    }[]
  >;
  public messageCounter: Map<string, number[]>;

  constructor(id?: string) {
    this.id = id ?? undefined;
    this.messageCounter = new Map();
    this.rules = new Map();
  }

  async create() {
    try {
      const result = await pool.query(
        `
        INSERT INTO guild (id, active)
        VALUES ($1, TRUE)
        ON CONFLICT (id)
        DO UPDATE SET active = TRUE, deactivated = NULL
        RETURNING *;
        `,
        [this.id]
      );
      return result.rows;
    } catch (error) {
      logger.error(error);
    }
  }

  async loadRulesOnSingleChannel(channelId: string) {
    try {
      if (ruleCache.has(channelId)) return ruleCache.get(channelId);
      const result = await pool.query(
        `
        SELECT 
          slowmode_rule.id,
          slowmode_rule.channel,
          slowmode_rule.messages,
          slowmode_rule.slowmode,
          slowmode_rule.interval,
          slowmode_rule.notify
        FROM slowmode_rule
        JOIN channel ON slowmode_rule.channel = channel.id
        WHERE channel.id = $1
        `,
        [channelId]
      );
      ruleCache.set(channelId, result.rows);
      return result.rows;
    } catch (error) {
      logger.error(error);
      return [];
    }
  }

  async load() {
    try {
      this.loadChannels();
      this.loadRules();
    } catch (error) {}
  }

  async getSlowmodeForChannel(channelId: string): Promise<{ slowmode: number; notify: boolean } | null> {
    const rules = await this.loadRulesOnSingleChannel(channelId);
    if (!rules || rules.length === 0) return null;

    const messages = this.messageCounter.get(channelId) || [];
    const now = Date.now();

    const maxInterval = Math.max(...rules.map((r) => r.interval * 1000));
    const recentMessages = messages.filter((ts) => now - ts <= maxInterval);
    this.messageCounter.set(channelId, recentMessages);

    let matchingRules: typeof rules = [];

    for (const rule of rules) {
      const timeframeMs = rule.interval * 1000;
      const recentCount = recentMessages.filter((ts) => now - ts <= timeframeMs).length;

      if (recentCount >= rule.messages) {
        matchingRules.push(rule);
      }
    }

    if (matchingRules.length === 0) return null;

    // Find the "strongest" rule (highest slowmode)
    const strongestRule = matchingRules.reduce((a, b) => (a.slowmode > b.slowmode ? a : b));

    return {
      slowmode: strongestRule.slowmode,
      notify: strongestRule.notify,
    };
  }

  registerMessageSend(channelId: string) {
    const now = Date.now();
    if (!this.messageCounter.has(channelId)) this.messageCounter.set(channelId, []);
    this.messageCounter.get(channelId).push(now);
  }

  clearMessages(channelId: string) {
    this.messageCounter.delete(channelId);
  }

  async addRule(channelId: string, rule: Rule) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
      INSERT INTO channel (id, guild)
      VALUES ($1, $2)
      ON CONFLICT (id) DO NOTHING
      `,
        [channelId, this.id]
      );

      await client.query(
        `
      INSERT INTO slowmode_rule (channel, messages, slowmode, interval, notify)
      VALUES ($1, $2, $3, $4, $5)
      `,
        [channelId, rule.messages, Math.min(Math.max(rule.slowmode, 0), 21600), rule.interval, rule.notify]
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error(error);
    } finally {
      client.release();
    }
  }

  async editRule(ruleId: string, rule: Rule) {
    const client = await pool.connect();

    try {
      await client.query(
        `
      UPDATE slowmode_rule SET messages = $1, slowmode = $2, interval = $3, notify = $4
      WHERE id = $5
      `,
        [rule.messages, Math.min(Math.max(rule.slowmode, 0), 21600), rule.interval, rule.notify, ruleId]
      );
    } catch (error) {
      logger.error(error);
    }
  }

  async removeRule(ruleId: string) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Get the channel ID for this rule
      const { rows: ruleRows } = await client.query("SELECT channel FROM slowmode_rule WHERE id = $1", [ruleId]);

      if (ruleRows.length === 0) {
        await client.query("ROLLBACK");
        logger.warn(`Rule ${ruleId} not found.`);
        return;
      }

      const channelId = ruleRows[0].channel;

      // 2. Delete the rule itself
      await client.query("DELETE FROM slowmode_rule WHERE id = $1", [ruleId]);

      // 3. Check if any other rules exist for this channel
      const { rows: remainingRules } = await client.query(
        "SELECT COUNT(*) AS count FROM slowmode_rule WHERE channel = $1",
        [channelId]
      );

      const count = parseInt(remainingRules[0].count, 10);

      // 4. If no rules remain, delete the channel too
      if (count === 0) {
        await client.query("DELETE FROM channel WHERE id = $1", [channelId]);
        logger.info(`Channel ${channelId} deleted (no remaining rules).`);
      }

      await client.query("COMMIT");
      logger.info(`Rule ${ruleId} removed successfully.`);
    } catch (error) {
      await client.query("ROLLBACK");
      logger.error("Error removing rule:", error);
    } finally {
      client.release();
    }
  }

  async clearChannelRules(channelId: string) {
    try {
      await pool.query(`DELETE FROM channel WHERE id = $1`, [channelId]);
    } catch (error) {
      logger.error(error);
    }
  }

  async loadChannels() {
    try {
      const result = await pool.query(`SELECT id FROM channel WHERE guild = '$1'`, [this.id]);
      this.channels = result.rows;
    } catch (error) {
      logger.error(error);
    }
  }

  async loadRules() {
    try {
      const result = await pool.query(
        `
        SELECT 
          slowmode_rule.id,
          slowmode_rule.channel,
          slowmode_rule.messages,
          slowmode_rule.slowmode,
          slowmode_rule.interval,
          slowmode_rule.notify
        FROM slowmode_rule
        JOIN channel ON slowmode_rule.channel = channel.id
        WHERE channel.guild = $1
        `,
        [this.id]
      );

      const ruleMap = new Map<
        string,
        {
          id: number;
          messages: number;
          slowmode: number;
          interval: number;
          notify: boolean;
        }[]
      >();

      for (const row of result.rows) {
        if (!ruleMap.has(row.channel)) {
          ruleMap.set(row.channel, []);
        }
        ruleMap.get(row.channel).push({
          id: row.id,
          messages: row.messages,
          slowmode: row.slowmode,
          interval: row.interval,
          notify: row.notify,
        });
      }

      this.rules = ruleMap;
    } catch (error) {
      logger.error(error);
    }
  }
}
