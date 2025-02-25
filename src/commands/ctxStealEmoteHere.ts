import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
} from "discord.js";

import { FeedbackManager } from "../utils/managers/FeedbackManager";
import findEmotesFromMessage from "../utils/discord/findEmotesInMessage";

import { DiscordBot } from "../types";
import prepareEmote from "../emotes/prepareEmote";
import { Messages } from "../constants/messages";

const ctxStealEmoteHere = {
  data: new ContextMenuCommandBuilder()
    .setName("Steal emote here")
    .setType(ApplicationCommandType.Message),
  async execute(interaction: MessageContextMenuCommandInteraction, client: DiscordBot) {
    const feedback = new FeedbackManager(interaction, {
      ephemeral: true,
    });

    await feedback.working();

    if (!interaction.memberPermissions!.has("ManageEmojisAndStickers")) {
      await feedback.missingPermissions();
      return;
    }

    const messageContent = interaction.targetMessage.content;
    const { username } = interaction.targetMessage.author;
    const emotes = findEmotesFromMessage(messageContent, username);

    if (emotes.length === 0) {
      await feedback.notFoundEmotes();
      return;
    }

    if (emotes.length > 1) {
      await feedback.error(Messages.MULTIPLE_EMOTES_NOT_SUPPORTED);
      return;
    }

    const emote = emotes[0];

    prepareEmote(emote, {
      feedback,
      interaction,
    });
  },
};

export default ctxStealEmoteHere;
