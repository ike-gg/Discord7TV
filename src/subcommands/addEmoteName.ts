import { ChatInputCommandInteraction } from "discord.js";
import { FeedbackManager } from "../utils/managers/FeedbackManager";
import searchEmote from "../api/7tv/searchEmote";
import { DiscordBot } from "../types";
import renderEmotesSelect from "../utils/emoteSelectMenu/renderEmotesSelect";
import getNavigatorRow from "../utils/emoteSelectMenu/getNavigatorRow";
import { EmoteListManager } from "../utils/managers/EmoteListManager";

const addEmoteName = async (
  interaction: ChatInputCommandInteraction,
  client: DiscordBot,
  feedback: FeedbackManager
) => {
  const emoteReference = interaction.options.get("name")?.value as string;
  let ignoreTags = interaction.options.get("ignoretags")?.value as boolean;

  if (ignoreTags === undefined) {
    ignoreTags = false;
  }

  try {
    const foundEmotes = await searchEmote(emoteReference, ignoreTags);

    if (foundEmotes.length === 0) {
      await feedback.error(
        `I couldn't find any emotes with \`${emoteReference}\` query.`
      );
      return;
    }

    const storeId = EmoteListManager.storeEmotes(emoteReference, foundEmotes)!;
    const pageOfEmotes = EmoteListManager.getEmotesInPages(storeId, 1)!;
    const storeInfo = EmoteListManager.getStoredInfo(storeId)!;

    const emotesEmbedsPreview = renderEmotesSelect(pageOfEmotes, client);

    const navigatorTask = client.tasks.addTask({
      action: "navigatorPage",
      feedback: feedback,
      interaction: interaction,
      emoteReference: emoteReference,
      storeId: storeId,
      options: {
        currentPage: 1,
        pagesLimit: storeInfo.pages,
      },
    });

    const navigatorRow = getNavigatorRow(navigatorTask, client, {
      nextDisabled: storeInfo.pages > 1 ? false : true,
      previousDisabled: true,
    });

    await feedback.sendMessage({
      components: [emotesEmbedsPreview.components, navigatorRow],
      embeds: emotesEmbedsPreview.embeds,
    });
  } catch (error) {
    console.error(error);
    await feedback.error(String(error).slice(0, 300));
  }
};

export default addEmoteName;