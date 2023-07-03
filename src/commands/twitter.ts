import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import fetch from "node-fetch";
import { DiscordBot } from "../types";
import { TwitterDL } from "twitter-downloader";
import isValidURL from "../utils/isValidURL";

const importEmote = {
  data: new SlashCommandBuilder()
    .setName("twitter")
    .setDescription("May stop working 🦦")
    .addStringOption((option) =>
      option.setName("url").setDescription("twitter url").setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction, client: DiscordBot) {
    // await interaction.reply(
    //   "Command temporarily disabled due to recent changes in Twitter's policies."
    // );

    try {
      await interaction.reply("<a:PepegaLoad:1085673146939621428>");
      const urlTweet = interaction.options.getString("url");

      if (!urlTweet) return;

      const id = urlTweet.match(/\/([\d]+)/);

      if (!id) {
        await interaction.editReply(`cant find tweet ID`);
        return;
      }

      const tweetId = id[1];
      const vxLink = `https://vxtwitter.com/i/status/${tweetId}`;

      const vxMsg = await interaction.editReply(vxLink);
      const msgEmbed = vxMsg.embeds[0];
      console.log(msgEmbed);

      const {
        data: { title, description, video, thumbnail },
      } = msgEmbed;

      if (!video && !thumbnail) {
        await interaction.editReply(`tweet type not supported.`);
        return;
      }

      let mediaBuffer: Buffer;

      if (video) {
        const source = await fetch(video.url!);
        mediaBuffer = await source.buffer();
      }

      if (thumbnail) {
        const source = await fetch(thumbnail.url!);
        mediaBuffer = await source.buffer();
      }

      if (!mediaBuffer!) {
        await interaction.editReply(
          "media unavailable or not supported file type"
        );
        return;
      }

      const mediaAttachment = new AttachmentBuilder(mediaBuffer);

      video && mediaAttachment.setName("video.mp4");
      thumbnail && mediaAttachment.setName("image.jpg");

      await interaction.editReply({
        files: [mediaAttachment],
        content: `${title ?? "Tweet author"}: ${description}`,
      });
    } catch (error) {
      console.log(error);
      await interaction.editReply(`cos jeblo! ${String(error)}`);
    }

    // try {
    //   await interaction.reply("<a:PepegaLoad:1085673146939621428>");

    //   const urlVideo = interaction.options.getString("url");

    //   if (!urlVideo) return;

    //   const data = await TwitterDL(urlVideo);

    //   if (!data || !data.result || data.status === "error") {
    //     await interaction.editReply(`cant reach post ||${data.message}||`);
    //     return;
    //   }

    //   const {
    //     caption,
    //     author: { username },
    //   } = data.result;
    //   const media = data.result?.media[0];

    //   const twitterLink = caption.split(" ").at(-1);
    //   const description = caption
    //     .split(" ")
    //     .slice(0, -1)
    //     .filter((word) => !isValidURL(word))
    //     .join(" ");

    //   if (!media) {
    //     await interaction.editReply(`post without media`);
    //     return;
    //   }

    //   let mediaBuffer: Buffer;

    //   if (media.type === "video" && Array.isArray(media.result)) {
    //     const bestQuality = media.result.sort((a, b) => {
    //       const valueA = Number(a.bitrate);
    //       const valueB = Number(b.bitrate);
    //       return valueB - valueA;
    //     })[0];

    //     const source = await fetch(bestQuality.url);
    //     mediaBuffer = await source.buffer();
    //   } else if (media.type === "photo" && typeof media.result === "string") {
    //     const source = await fetch(media.result);
    //     mediaBuffer = await source.buffer();
    //   }

    //   if (!mediaBuffer!) {
    //     await interaction.editReply(
    //       "media unavailable or not supported file type"
    //     );
    //     return;
    //   }

    //   const videoAttachment = new AttachmentBuilder(mediaBuffer);

    //   media.type === "video" && videoAttachment.setName("video.mp4");
    //   media.type === "photo" && videoAttachment.setName("image.jpg");

    //   await interaction.editReply({
    //     files: [videoAttachment],
    //     content: `${username}: ${description} *<${twitterLink}>*`,
    //   });
    // } catch (error) {
    //   console.log(error);
    //   await interaction.editReply(`cos jeblo! ${String(error)}`);
    // }
  },
};

export default importEmote;
