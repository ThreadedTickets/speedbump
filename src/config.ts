import "@dotenvx/dotenvx";
import { CacheWithLimitsOptions } from "discord.js";

export default {
  client: {
    token: process.env["DISCORD_TOKEN"] ?? null,
    cache: {} as CacheWithLimitsOptions,
  },

  prefix: ">",

  owner: process.env["DISCORD_OWNER"] ?? "",
  admins: (process.env["DISCORD_ADMINS"] ?? "").split(", "),
} as const;
