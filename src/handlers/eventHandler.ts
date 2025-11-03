import path from "path";
import { loadFilesRecursively } from "../utils/commands/load";

export type EventData = {
  blacklist?: {
    active: boolean;
    type: "user" | "server";
    reason: string;
  };
};

export const loadEvents = async (client: {
  once: (eventName: string, listener: (...args: any[]) => any) => void;
  on: (eventName: string, listener: (...args: any[]) => any) => void;
}) => {
  const eventFiles = loadFilesRecursively(path.join(__dirname, "../events"));

  for (const file of eventFiles) {
    const event = (await import(file)).default;

    const listener = async (...args: any[]) => {
      return event.execute(client, {} as EventData, ...args);
    };

    if (event.once) {
      client.once(event.name, listener);
    } else {
      client.on(event.name, listener);
    }
  }
};
