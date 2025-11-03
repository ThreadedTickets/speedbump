import { Event } from "../types/Event";
import logger from "../utils/logger";

const event: Event<"clientReady"> = {
  name: "clientReady",
  once: true,
  execute(client) {
    logger.info("Startup", "Info", `${client.user?.username} is running`);
  },
};

export default event;
