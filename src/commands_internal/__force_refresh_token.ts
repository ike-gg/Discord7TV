import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { FeedbackManager } from "../utils/managers/FeedbackManager";

const here = {
  data: new SlashCommandBuilder()
    .setName("forcerefreshtoken")
    .setDescription("refresh user tokens"),
  async execute(interaction: ChatInputCommandInteraction) {
    const feedback = new FeedbackManager(interaction, {
      ephemeral: true,
    });

    await feedback.info("refreshing tokens...");

    try {
      // refreshUsersTokens();
    } catch (error) {
      await feedback.handleError(error);
    }
  },
};

export default here;
