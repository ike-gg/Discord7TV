import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { DiscordBot } from "../types";
import getBufferFromUrl from "../emotes/source/getBufferFromUrl";
//@ts-ignore
import instagramDl from "@sasmeee/igdl";
import { z } from "zod";

const instagramReelSchema = z.object({
  download_link: z.string().url(),
  thumbnail_link: z.string().optional(),
});

const importEmote = {
  data: new SlashCommandBuilder()
    .setName("instagram")
    .setDescription("(only reels supported)")
    .addStringOption((option) =>
      option.setName("url").setDescription("url").setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction, client: DiscordBot) {
    try {
      await interaction.reply("<a:PepegaLoad:1085673146939621428>");
      const urlVideo = interaction.options.getString("url");

      if (!urlVideo) return;

      const reelsDetails = (await instagramDl(urlVideo)) as any[];

      if (reelsDetails.length === 0) {
        await interaction.editReply("empty payload, reels not found");
        return;
      }

      const reelsData = instagramReelSchema.safeParse(reelsDetails[0]);

      if (!reelsData.success) {
        await interaction.editReply("invalid url/unauthorized/invalid schema");
        return;
      }

      const video = await getBufferFromUrl(reelsData.data.download_link);

      const videoAttachment = new AttachmentBuilder(video);
      videoAttachment.setName("video.mp4");
      await interaction.editReply({
        files: [videoAttachment],
        content: "",
      });
    } catch (error) {
      await interaction.editReply(`cos jeblo! ${String(error)}`);
    }
  },
};

export default importEmote;