import logger from "../../logger";
import { registerHook } from "../index";

registerHook("TestEvent", async (message) => {
  logger.info("Hooks", "Info", `Message: ${message}`);
});
