import fs from "node:fs";
import path from "path";

import { env } from "./env";

import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".ts"))
  .filter((file) => {
    if (file.startsWith("__")) return false;
    return true;
  });

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  commands.push(command.default.data.toJSON());
}

const rest = new REST({
  version: "10",
}).setToken(env.discordBotToken);

(async () => {
  try {
    console.log(`started refreshing ${commands.length} applications commands`);

    const data = await rest.put(Routes.applicationCommands(env.discordBotId), {
      body: commands,
    });

    //@ts-ignore
    console.log(`successfully reloaded ${data.length} commands`);
  } catch (error) {
    console.error(error);
  }
})();
