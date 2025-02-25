import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { env } from "../env";
import { DiscordBot } from "../types";
import URLButton from "../utils/elements/URLButton";

const invitebot = {
  data: new SlashCommandBuilder()
    .setName("invitebot")
    .setDescription("Invite bot to your discord server"),
  async execute(interaction: CommandInteraction, client: DiscordBot) {
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      URLButton("Invite link", env.INVITE_LINK)
    );

    await interaction.reply({
      components: [actionRow],
    });
  },
};

export default invitebot;
