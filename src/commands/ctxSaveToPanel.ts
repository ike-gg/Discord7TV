import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
  ContextMenuCommandType,
} from "discord.js";

import { FeedbackManager } from "../utils/managers/FeedbackManager";
import findEmotesFromMessage from "../utils/discord/findEmotesInMessage";

import { DiscordBot } from "../types";
import { Messages } from "../constants/messages";
import { PrismaClient, Emotes } from "@prisma/client";

const ctxStealEmote = {
  data: new ContextMenuCommandBuilder()
    .setName("Save to Panel")
    .setType(ApplicationCommandType.Message),
  async execute(interaction: MessageContextMenuCommandInteraction, client: DiscordBot) {
    const feedback = new FeedbackManager(interaction, {
      ephemeral: true,
    });

    const messageContent = interaction.targetMessage.content;
    const { username } = interaction.targetMessage.author;
    const emotes = findEmotesFromMessage(messageContent, username);

    if (emotes.length === 0) {
      await feedback.error(Messages.EMOTE_NOT_FOUND);
      return;
    }

    if (emotes.length > 5) {
      await feedback.error(
        "Save to Panel works only with messages that contains maximum of 5 emotes."
      );
      return;
    }

    const savedEmoteExpireTime = 1000 * 60 * 60 * 24 * 7;
    const currentTime = new Date();

    try {
      const prisma = new PrismaClient();
      await prisma.emotes.createMany({
        data: emotes.map((emote) => ({
          accountId: interaction.user.id,
          emoteName: emote.name,
          emoteUrl: emote.file.url,
          expiresOn: new Date(currentTime.getTime() + savedEmoteExpireTime),
          origin: "DISCORD",
          reference: emote.id,
          animated: emote.animated,
        })),
      });
      await prisma.$disconnect();
      await feedback.panel("Emote(s) saved to Panel.");
    } catch (error) {
      await feedback.error("Saving emote to panel failed.");
    }
  },
};

export default ctxStealEmote;

// finding common servers based on cached guilds
//
// const filteregGuilds = client.guilds.cache
//   .filter((guild) => guild.members.cache.get(interaction.user.id))
//   .filter((guild) => {
//     const userInGuild = guild.members.cache.get(interaction.user.id);
//     if (!userInGuild) return false;
//     const userHasPermissions = userInGuild.permissions.has(
//       "ManageEmojisAndStickers"
//     );
//     return userHasPermissions;
//   })
//   .map((guild) => guild);
