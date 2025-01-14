import { ButtonInteraction } from "discord.js";
import { DiscordBot } from "../types";
import { parseEntitlementsData } from "../utils/discord/parseEntitlementsData";
import { FeedbackManager } from "../utils/managers/FeedbackManager";

const premiumoffering = {
  data: {
    name: "premiumoffering",
  },
  async execute(interaction: ButtonInteraction, client: DiscordBot) {
    const { hasPremium } = parseEntitlementsData(interaction);

    const feedback = new FeedbackManager(interaction);

    if (hasPremium) {
      await feedback.premium("You already have premium!");
      return;
    }

    await interaction.sendPremiumRequired();
  },
};

export default premiumoffering;
