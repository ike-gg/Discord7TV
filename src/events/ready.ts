import { Events } from "discord.js";

import { EventHandler } from ".";

import { BotConsole } from "#/loggers";

export const readyHandler: EventHandler<Events.ClientReady> = async (client) => {
  BotConsole.success(`Logged in as ${client.user.username}`);
};
