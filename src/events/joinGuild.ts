import { Event } from "../types/Event";
import Server from "../utils/classes/Server";
import logger from "../utils/logger";

const event: Event<"guildCreate"> = {
  name: "guildCreate",
  async execute(client, data, guild) {
    const server = new Server(guild.id);
    await server.create();
    logger.debug(`Added to ${guild.name} (${guild.id})`);
  },
};

export default event;
