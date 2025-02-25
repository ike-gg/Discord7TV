import {
  ButtonInteraction,
  Collection,
  CommandInteraction,
  SelectMenuInteraction,
  SlashCommandBuilder,
} from "discord.js";
import fs from "fs";
import path from "path";

import { env, isDevelopment } from "./env";
import { DiscordBot } from "./types";

const importInteractions = (client: DiscordBot) => {
  client.commands = new Collection();
  importCommands(client.commands);

  client.buttonInteractions = new Collection();
  importButtonInteractions(client.buttonInteractions);

  client.selectMenu = new Collection();
  importSelectMenu(client.selectMenu);
};

const importCommands = (clientCommands: Collection<string, CommandInteraction>) => {
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => path.join(commandsPath, file));

  const internalCommandsPath = path.join(__dirname, "commands_internal");
  const internalCommandFiles = fs
    .readdirSync(internalCommandsPath)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => path.join(internalCommandsPath, file));

  const commandsToLoad = isDevelopment
    ? [...internalCommandFiles, ...commandFiles]
    : commandFiles;

  for (const file of commandsToLoad) {
    import(file).then((command) => {
      const commandData = command.default.data as SlashCommandBuilder;

      if (isDevelopment) {
        commandData.setName(`dev${commandData.name}`);
      }

      clientCommands.set(commandData.name, command.default);
    });
  }
};

const importButtonInteractions = (
  clientButtonInteractions: Collection<string, ButtonInteraction>
) => {
  const buttonInteractionsPath = path.join(__dirname, "buttonInteractions");
  const buttonInteractionsFiles = fs
    .readdirSync(buttonInteractionsPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of buttonInteractionsFiles) {
    const filePath = path.join(buttonInteractionsPath, file);
    import(filePath).then((buttonInteraction) => {
      clientButtonInteractions.set(
        buttonInteraction.default.data.name,
        buttonInteraction.default
      );
    });
  }
};

const importSelectMenu = (clientCommands: Collection<string, SelectMenuInteraction>) => {
  const selectMenuPath = path.join(__dirname, "selectMenu");
  const selectMenuFiles = fs
    .readdirSync(selectMenuPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of selectMenuFiles) {
    const filePath = path.join(selectMenuPath, file);
    import(filePath).then((selectMenuInteraction) => {
      clientCommands.set(
        selectMenuInteraction.default.data.name,
        selectMenuInteraction.default
      );
    });
  }
};

export default importInteractions;
