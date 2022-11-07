import { EmbedBuilder } from "@discordjs/builders";

const emotePreviewEmbed = (options: {
  number: string;
  name: string;
  author?: string;
  preview: string;
}): EmbedBuilder => {
  const { number, name, author, preview } = options;
  const embed = new EmbedBuilder()
    .setFields({ name: `${number} **${name}**`, value: `by ${author}` })
    .setThumbnail(preview)
    .setColor(0x5865f2);
  return embed;
};

export default emotePreviewEmbed;