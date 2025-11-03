import { Event } from "../types/Event";
import Server from "../utils/classes/Server";
import pool from "../utils/database/db";
import logger from "../utils/logger";

const event: Event<"guildDelete"> = {
  name: "guildDelete",
  async execute(client, data, guild) {
    await pool.query("DELETE FROM guild WHERE id = $1", [guild.id]);
    logger.debug(`Removed from ${guild.name} (${guild.id})`);
  },
};

export default event;
