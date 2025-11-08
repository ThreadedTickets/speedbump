import { ChannelType } from "discord.js";
import { Event } from "../types/Event";
import Server, { serverCache } from "../utils/classes/Server";
import logger from "../utils/logger";
import debugLogManager from "../utils/classes/GuildDebugLogger";

const slowmdoeUpdates = new Map<string, number>();

const event: Event<"messageCreate"> = {
  name: "messageCreate",
  async execute(client, data, message) {
    if (message.author.id === client.user.id) return;
    if (!message.guildId) return;
    if (!message.channel || message.channel.type !== ChannelType.GuildText) return;

    // reuse existing Server instance or create one if new
    let server = serverCache.get(message.guildId);
    if (!server) {
      server = new Server(message.guildId);
      serverCache.set(message.guildId, server);
      debugLogManager.log(message.guildId, {
        level: "INFO",
        message: `Cache miss on message create`,
      });
    }

    // now the messageCounter persists between messages
    server.registerMessageSend(message.channelId);

    const result = await server.getSlowmodeForChannel(message.channelId);
    if (!result) {
      debugLogManager.log(message.guildId, {
        level: "INFO",
        message: `No rules in ${message.channelId} (${message.channel.name}) - ignoring message`,
      });
      return server.clearMessages(message.channelId);
    }

    debugLogManager.log(message.guildId, {
      level: "INFO",
      message: `Slowmode result in channel ${message.channelId} (${message.channel.name}): ${result.slowmode}, notify ${result.notify}`,
    });

    const { slowmode, notify } = await server.getSlowmodeForChannel(message.channelId);
    const oldSlowmode = message.channel.rateLimitPerUser;

    debugLogManager.log(message.guildId, {
      level: "DEBUG",
      message: `Channel ${message.channelId} (${message.channel.name}) old slowmode: ${oldSlowmode}, new slowmode: ${result.slowmode}`,
    });

    const hasUpdatedRecently = slowmdoeUpdates.has(message.channelId);
    if (hasUpdatedRecently)
      return debugLogManager.log(message.guildId, {
        level: "INFO",
        message: `Channel ${message.channelId} has been updated recently - ignoring`,
      });

    if (slowmode !== null && slowmode !== oldSlowmode) {
      try {
        message.channel.setRateLimitPerUser(slowmode);
        slowmdoeUpdates.set(message.channelId, 1);

        debugLogManager.log(message.guildId, {
          level: "INFO",
          message: `Channel ${message.channelId} slowmode updated to ${slowmode}, cannot change again for 60 seconds`,
        });

        setTimeout(() => {
          slowmdoeUpdates.delete(message.channelId);
          debugLogManager.log(message.guildId, {
            level: "INFO",
            message: `Channel ${message.channelId} can now accept slowmode updates again`,
          });
        }, 60 * 1000); // Only allow the slowmode to be changed every 60 seconds

        if (notify) message.channel.send(`Slowmode changed to ${slowmode} seconds`);
      } catch (error) {
        logger.error(error);
        debugLogManager.log(message.guildId, {
          level: "ERROR",
          message: `Channel ${message.channelId} (${message.channel.name}): ${error}`,
        });
      }
    }
  },
};

export default event;
