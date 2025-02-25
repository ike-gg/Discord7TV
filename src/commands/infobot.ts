import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandInteraction,
  EmbedBuilder,
  hyperlink,
  SlashCommandBuilder,
} from "discord.js";

import { env } from "../env";
import { DiscordBot } from "../types";
import URLButton from "../utils/elements/URLButton";

const infobot = {
  data: new SlashCommandBuilder()
    .setName("infobot")
    .setDescription("Some information about bot."),
  async execute(interaction: CommandInteraction, client: DiscordBot) {
    const githubRepo = "https://github.com/ike-gg/Tetra";
    const githubAuthor = "https://github.com/ike-gg";
    const discordAuthor = "https://discordapp.com/users/224978978362884096/";
    const activeGuilds = client.guilds.cache.size;
    const reachableUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

    const dcInvLink = hyperlink("Click here!", env.INVITE_LINK);
    const ghRepoLink = hyperlink("@ike-gg/Tetra", githubRepo);
    const ghAuthorLink = hyperlink("@ike-gg", githubAuthor);
    const dcAuthorLink = hyperlink("ike", discordAuthor);

    const componentsRow = new ActionRowBuilder<ButtonBuilder>();
    componentsRow.addComponents(
      URLButton("Invite link", env.INVITE_LINK),
      URLButton("Discord Owner", discordAuthor),
      URLButton("GitHub Repo", githubRepo),
      URLButton("GitHub Owner", githubAuthor)
    );

    const messagePayload = new EmbedBuilder();
    messagePayload.setTitle("Bot informations");
    messagePayload.setFooter({
      text: client.user!.username,
      iconURL: client.user!.avatarURL()!,
    });
    messagePayload.addFields({
      name: "Invite link",
      value: dcInvLink,
      inline: true,
    });
    messagePayload.addFields({
      name: "Active servers",
      value: activeGuilds.toString(),
      inline: true,
    });
    messagePayload.addFields({
      name: "Users",
      value: reachableUsers.toString(),
      inline: true,
    });
    messagePayload.addFields({
      name: "Discord Owner",
      value: dcAuthorLink,
      inline: true,
    });
    messagePayload.addFields({
      name: "GitHub repository",
      value: ghRepoLink,
      inline: true,
    });
    messagePayload.addFields({
      name: "GitHub Owner",
      value: ghAuthorLink,
      inline: true,
    });
    messagePayload.setImage("https://i.imgur.com/vkJxLA2.png");
    messagePayload.setColor(0x000000);
    await interaction.reply({
      embeds: [messagePayload],
      components: [componentsRow],
    });
  },
};

export default infobot;
