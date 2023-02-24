import { Interaction, TextChannel } from "discord.js";
import { DiscordBot } from "../types";

const interactionLogger = async (
  interaction: Interaction,
  client: DiscordBot
) => {
  const announceChannel = (await client.channels.fetch(
    "1074256923119063123"
  )) as TextChannel;

  if (!announceChannel) return;

  const { guild, user, id } = interaction;

  if (interaction.isCommand()) {
    announceChannel.send(
      `new interaction \`ID: ${id}\` \`${interaction.commandName}\`, user \`${
        user.id
      } (${user.username})\`, guild: \`${guild?.name} counts ${
        guild?.memberCount
      } users\`, \`\`\`${JSON.stringify(interaction.options).slice(
        0,
        1250
      )}\`\`\``
    );
  }
};

export default interactionLogger;
