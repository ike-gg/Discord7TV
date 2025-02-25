import { Interaction } from "discord.js";

import { env, isDevelopment, isProduction } from "./env";
import {
  DiscordBot,
  ExecutableButtonInteraction,
  ExecutableCommandInteraction,
  ExecutableSelectMenu,
} from "./types";
import interactionLogger from "./utils/interactionLoggers";
import { FeedbackManager } from "./utils/managers/FeedbackManager";

const interactionHandler = async (interaction: Interaction, client: DiscordBot) => {
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(
      interaction.commandName
    ) as ExecutableCommandInteraction;

    if (!command) return;

    try {
      command.autocomplete(interaction, client);
    } catch {
      console.error("not found autocomplete function for this.");
    }
  }

  if (interaction.isCommand()) {
    interactionLogger(interaction, client);

    const command = client.commands.get(
      interaction.commandName
    ) as ExecutableCommandInteraction;

    if (!command) return;

    try {
      command.execute(interaction, client);
    } catch {}
  }

  const isButtonInteraction = interaction.isButton();
  const isSelectMenuInteraction = interaction.isSelectMenu();

  if (isButtonInteraction || isSelectMenuInteraction) {
    const feedback = new FeedbackManager(interaction);

    const isDevCommand = interaction.message.interaction?.commandName.startsWith("dev");

    if (isDevelopment && !isDevCommand) return;
    if (isProduction && isDevCommand) return;

    const isForAll = interaction.customId.split(":")[1] === "all";

    const currentUserId = interaction.user.id;
    const originalUserId = interaction.message.interaction!.user.id;

    if (currentUserId !== originalUserId && !isForAll) {
      interaction.deferUpdate();
      return;
    }

    const interactionTaskId = interaction.customId.split(":")[0];

    let taskDetails;

    if (interactionTaskId === "cancelAction") {
      taskDetails = {
        action: "cancelAction",
      };
    } else if (interactionTaskId === "errorlog") {
      taskDetails = {
        action: "errorLog",
      };
    } else if (interactionTaskId === "premiumoffering") {
      taskDetails = {
        action: "premiumoffering",
      };
    } else if (interactionTaskId === "describeMedia") {
      taskDetails = {
        action: "describeMedia",
      };
    } else {
      taskDetails = client.tasks.getTask(interactionTaskId);
    }

    if (!taskDetails) {
      await feedback.removeComponents();
      await feedback.interactionTimeout();
      return;
    }

    if (isButtonInteraction) {
      const buttonInteraction = client.buttonInteractions.get(
        taskDetails.action
      ) as ExecutableButtonInteraction;

      if (!buttonInteraction) return;

      try {
        buttonInteraction.execute(interaction, client);
      } catch {
        console.error;
      }
    }

    if (isSelectMenuInteraction) {
      const selectMenuInteraction = client.selectMenu.get(
        taskDetails.action
      ) as ExecutableSelectMenu;

      if (!selectMenuInteraction) return;

      try {
        selectMenuInteraction.execute(interaction, client);
        await feedback.removeComponents();
      } catch {
        console.error;
      }
    }
  }
};

export default interactionHandler;
