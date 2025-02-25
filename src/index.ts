import DiscordOauth2 from "discord-oauth2";
import { Client, GatewayIntentBits, Options, ClientEvents } from "discord.js";

import { initApi } from "./api";
import { env, isProduction } from "./env";
import { clientEvents } from "./events";
import importInteractions from "./importInteractions";
import { DiscordBot } from "./types";
import TaskManager from "./utils/managers/TaskManager";

import { BotConsole, CoreConsole } from "#/loggers";

if (isProduction) CoreConsole.warn("Running in production mode.");
else CoreConsole.info("Running in development mode.");

initApi();

const client = new Client({
  intents: [
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
  makeCache: Options.cacheWithLimits(Options.DefaultMakeCacheSettings),
}) as DiscordBot;

importInteractions(client);

client.tasks = TaskManager.getInstance();

clientEvents.forEach((callback, event) => {
  client.on(event, callback);
});

client.login(env.DISCORD_BOT_TOKEN);

const discordOauth = new DiscordOauth2({
  clientId: env.DISCORD_OAUTH_CLIENT_ID,
  clientSecret: env.DISCORD_OAUTH_CLIENT_SECRET,
  version: "v10",
});

export { client, discordOauth };
