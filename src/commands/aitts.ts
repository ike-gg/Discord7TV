import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { OpenAI } from "openai";

import { env } from "../env";
import { DiscordBot } from "../types";
import { parseEntitlementsData } from "../utils/discord/parseEntitlementsData";
import { FeedbackManager } from "../utils/managers/FeedbackManager";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const supportedModels = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

const importEmote = {
  data: new SlashCommandBuilder()
    .setName("aitts")
    .setDescription("based on open ai tts")
    .addStringOption((option) =>
      option
        .setName("model")
        .setDescription("voice model")
        .setRequired(true)
        .addChoices(
          ...supportedModels.map((model) => ({
            name: model,
            value: model,
          }))
        )
    )
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("text to speech")
        .setRequired(true)
        .setMaxLength(200)
        .setMinLength(2)
    ),
  async execute(interaction: ChatInputCommandInteraction, client: DiscordBot) {
    const { hasPremium } = parseEntitlementsData(interaction);

    if (!hasPremium) {
      await interaction.sendPremiumRequired();
      return;
    }

    const feedback = await new FeedbackManager(interaction);

    try {
      const model = interaction.options.getString("model") as
        | "alloy"
        | "echo"
        | "fable"
        | "onyx"
        | "nova"
        | "shimmer";
      const text = interaction.options.getString("text");

      if (!model || !text) return;

      await feedback.premium("Processing...");

      const ai = await openai.audio.speech.create({
        input: text,
        model: "tts-1-hd",
        voice: model,
        response_format: "mp3",
      });

      const arrayBuffer = await ai.arrayBuffer();

      const buffer = Buffer.from(arrayBuffer);

      await feedback.sendMessage({
        files: [
          new AttachmentBuilder(buffer, {
            name: `${interaction.user.username}${interaction.id}.mp3`,
          }),
        ],
        content: "",
        embeds: [],
      });
    } catch (error) {
      await feedback.handleError(error);
    }
  },
};

export default importEmote;
