import { formatDate } from "../formatters/date";
import logger from "../logger";

type LogEvent = {
  level: "INFO" | "ERROR" | "DEBUG";
  message: string;
  time: Date;
};

export class DebugLogManager {
  public loggers: Map<string, DebugLogger>;
  public timeouts: Map<string, NodeJS.Timeout>;

  constructor() {
    this.loggers = new Map<string, DebugLogger>();
    this.timeouts = new Map<string, NodeJS.Timeout>();
  }

  register(server: string, ttl = 30 * 60 * 60) {
    const lgr = new DebugLogger(server);
    this.loggers.set(server, lgr);
    logger.debug(`Registered new debug logger for ${server}, ttl = ${ttl}`);

    const timeout = setTimeout(() => {
      this.unregister(server);
    }, ttl * 1000);

    this.timeouts.set(server, timeout);
  }

  unregister(server: string) {
    this.loggers.delete(server);

    const timeout = this.timeouts.get(server);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(server);
    }

    logger.debug(`Unregistered debug logger for ${server}, timeout = ${timeout ? "yes" : "no"}`);
  }

  getActive(server: string) {
    const lgr = this.loggers.get(server);
    if (lgr) return lgr.logFile;

    return null;
  }

  log(server: string, event: Omit<LogEvent, "time">) {
    const lgr = this.loggers.get(server);

    if (!lgr) return;

    lgr.addLog({ ...event, time: new Date() });
  }
}

export class DebugLogger {
  public guild: string;
  public logEvents: string[];
  public created: Date;

  constructor(guild: string) {
    this.guild = guild;
    this.created = new Date();
    this.logEvents = [];
  }

  addLog(event: LogEvent) {
    this.logEvents.push(`[${event.level}] [${formatDate(event.time, "DD/MM/YY HH:mm:ss")}] ${event.message}`);
    logger.debug(`Captured guild ${this.guild} log event`, event);
  }

  get logFile() {
    return Buffer.from(this.logEvents.join("\n"));
  }
}

const debugLogManager = new DebugLogManager();
export default debugLogManager;
