import { Events } from "discord.js";

import interactionHandler from "@/interactionHandler";

import { EventHandler } from ".";
import { client } from "..";

export const interactionCreateHandler: EventHandler<Events.InteractionCreate> = async (
  interaction
) => {
  const inGuild = interaction.inGuild();

  if (!inGuild) {
    return;
  }

  const isCommand = interaction.isCommand();
  const isButton = interaction.isButton();
  const isSelectMenu = interaction.isSelectMenu();
  const isAutocomplete = interaction.isAutocomplete();

  const supportedInteraction = isCommand || isButton || isSelectMenu || isAutocomplete;

  if (supportedInteraction) {
    try {
      interactionHandler(interaction, client);
    } catch (error) {
      console.error("Failed to handle interaction: ", error);
    }
  }
};
