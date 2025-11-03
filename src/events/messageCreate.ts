import { ChannelType } from "discord.js";
import { Event } from "../types/Event";
import Server, { serverCache } from "../utils/classes/Server";
import logger from "../utils/logger";

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
    }

    // now the messageCounter persists between messages
    server.registerMessageSend(message.channelId);

    const result = await server.getSlowmodeForChannel(message.channelId);
    if (!result) return server.clearMessages(message.channelId);

    const { slowmode, notify } = await server.getSlowmodeForChannel(message.channelId);
    const oldSlowmode = message.channel.rateLimitPerUser;

    if (slowmode !== null && slowmode !== oldSlowmode && !slowmdoeUpdates.has(message.channelId)) {
      try {
        message.channel.setRateLimitPerUser(slowmode);

        if (notify) message.channel.send(`Slowmode changed to ${slowmode} seconds`);

        slowmdoeUpdates.set(message.channelId, 1);
        setTimeout(() => {
          slowmdoeUpdates.delete(message.channelId);
        }, 60 * 1000); // Only allow the slowmode to be changed every 60 seconds
      } catch (error) {
        logger.error(error);
      }
    }
  },
};

export default event;
