import "@dotenvx/dotenvx";
import { Client, GatewayIntentBits, Options, Partials } from "discord.js";
import { loadPrefixCommands } from "./handlers/commandHandler";
import { deployAppCommands } from "./handlers/interactionCommandHandler";
import { loadEvents } from "./handlers/eventHandler";
import { loadInteractionHandlers } from "./handlers/interactionHandlers";
import "./utils/hooks/register";
import "./utils/database/db";
import Server from "./utils/classes/Server";
import RuleCache from "./utils/classes/RuleCache";

const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel],
  makeCache: Options.cacheWithLimits({
    ApplicationCommandManager: 0,
    ApplicationEmojiManager: 0,
    AutoModerationRuleManager: 0,
    BaseGuildEmojiManager: 0,
    DMMessageManager: 0,
    EntitlementManager: 0,
    GuildBanManager: 0,
    GuildEmojiManager: 0,
    GuildForumThreadManager: 0,
    GuildInviteManager: 0,
    GuildMemberManager: 0,
    GuildMessageManager: 0,
    GuildScheduledEventManager: 0,
    GuildStickerManager: 0,
    GuildTextThreadManager: 0,
    MessageManager: 0,
    PresenceManager: 0,
    ReactionManager: 0,
    ReactionUserManager: 0,
    StageInstanceManager: 0,
    ThreadManager: 0,
    ThreadMemberManager: 0,
    UserManager: 0,
    VoiceStateManager: 0,
  }),
  sweepers: {
    ...Options.DefaultSweeperSettings,
    messages: {
      interval: 3_600, // Every hour.
      lifetime: 1_800, // Remove messages older than 30 minutes.
    },
    users: {
      interval: 3_600,
      filter: () => (user) => user.id !== process.env["DISCORD_CLIENT_ID"], // Remove all bots.
    },
    threadMembers: {
      interval: 3_600,
      filter: () => (user) => user.id !== process.env["DISCORD_CLIENT_ID"],
    },
    threads: {
      interval: 3_600,
      lifetime: 1_800,
    },
  },
});
export const client = discordClient;

loadPrefixCommands();
deployAppCommands();
loadEvents(client);
loadInteractionHandlers();

export const ruleCache = new RuleCache(60 * 5);
export const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

client.login(process.env["DISCORD_TOKEN"]);
