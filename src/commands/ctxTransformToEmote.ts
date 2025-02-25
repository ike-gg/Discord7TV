import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
} from "discord.js";

import { DiscordBot, Emote } from "../types";
import { FeedbackManager } from "../utils/managers/FeedbackManager";
import getTenorGif from "../emotes/source/file/getTenorGif";
import isValidURL from "../utils/isValidURL";
import prepareEmote from "../emotes/prepareEmote";
import getImgurFile from "../emotes/source/file/getImgurFile";
import getEmoteFromUrl from "../emotes/source/file/getEmoteFromUrl";
import getGiphyGif from "../emotes/source/file/getGiphyGif";

const ctxStealReaction = {
  data: new ContextMenuCommandBuilder()
    .setName("File to emote")
    .setType(ApplicationCommandType.Message),
  async execute(interaction: MessageContextMenuCommandInteraction, client: DiscordBot) {
    const feedback = new FeedbackManager(interaction);

    await feedback.working();

    if (!interaction.memberPermissions?.has("ManageEmojisAndStickers")) {
      await feedback.missingPermissions();
      return;
    }

    let attachment: {
      url: string;
      provider: string;
    } | null = null;

    const { attachments, embeds, content } = interaction.targetMessage;

    if (isValidURL(content)) {
      attachment = {
        provider: "source",
        url: content,
      };
    }

    const targetAttachments = attachments.at(0);
    if (targetAttachments) {
      attachment = {
        provider: "discord",
        url: targetAttachments.url,
      };
    }

    const targetEmbed = embeds.filter((embed) => embed.url && embed.provider).at(0);
    if (targetEmbed) {
      const { url, provider } = targetEmbed;
      if (!url || !provider) return;
      attachment = {
        provider: provider.name!,
        url,
      };
    }

    if (!attachment) {
      await feedback.notFoundFile();
      return;
    }

    let emoteSource: Emote | null = null;

    try {
      switch (attachment.provider) {
        case "Tenor":
          emoteSource = await getTenorGif(attachment.url);
          break;
        case "Imgur":
          emoteSource = await getImgurFile(attachment.url);
          break;
        case "source":
          emoteSource = await getEmoteFromUrl(attachment.url);
          break;
        case "discord":
          emoteSource = await getEmoteFromUrl(attachment.url);
          break;
        case "Giphy":
          emoteSource = await getGiphyGif(attachment.url);
          break;
        default:
          await feedback.error(`${attachment.provider} provider not supported yet.`);
          return;
      }
    } catch (error) {
      await feedback.handleError(error);
      return;
    }

    if (!emoteSource) {
      await feedback.error("Cant reach original source file.");
      return;
    }

    prepareEmote(emoteSource, {
      feedback,
      interaction,
    });
  },
};

export default ctxStealReaction;
