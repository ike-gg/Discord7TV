import { ApiClient } from "@twurple/api";
import { RefreshingAuthProvider } from "@twurple/auth";
import { rawDataSymbol } from "@twurple/common";

import { env } from "../../env";
import { Emote } from "../../types";

const authProvider = new RefreshingAuthProvider({
  clientId: env.TWITCH_CLIENT_ID,
  clientSecret: env.TWITCH_SECRET_KEY,
});

const twitchApi = new ApiClient({
  authProvider,
});

export class TwitchManager {
  public client = twitchApi;

  static async getLiveChannels(query: string) {
    try {
      const liveChannels = await twitchApi.search.searchChannels(query, {
        liveOnly: true,
        limit: 10,
      });
      return liveChannels.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Uncaught error while fetching live channels list.");
      }
    }
  }

  static async getChannels(query: string) {
    try {
      const channels = await twitchApi.search.searchChannels(query, {
        limit: 10,
      });
      return channels.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Uncaught error while fetching channels list.");
      }
    }
  }

  static async getChannel(channelName: string) {
    try {
      const channel = await twitchApi.users.getUserByName(channelName);
      return channel;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Uncaught error while fetching channel details.");
      }
    }
  }

  static async getChannelInfo(channelName: string) {
    try {
      const channel = await twitchApi.streams.getStreamByUserName(channelName);
      return channel;
    } catch (error) {
      console.log(error);
    }
  }

  static async getChannelEmotes(channelId: string): Promise<Emote[]> {
    try {
      const emotes = await twitchApi.chat.getChannelEmotes(channelId);

      return emotes.map((emote) => {
        const { formats, id, name } = emote;

        const isAnimated = formats.includes("animated");
        const url = isAnimated
          ? emote.getAnimatedImageUrl("3.0")
          : emote.getStaticImageUrl("3.0");

        const previewUrl = isAnimated
          ? emote.getAnimatedImageUrl("2.0")
          : emote.getStaticImageUrl("2.0");

        return {
          animated: formats.includes("animated"),
          author: "twitch channel",
          file: {
            preview: previewUrl!,
            url: url!,
          },
          id: id,
          name: name,
          origin: "twitch",
        };
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Uncaught error while fetching emotes from channel.");
      }
    }
  }

  static async getClip(clipId: string) {
    const clip = await twitchApi.clips.getClipById(clipId);

    if (!clip) return null;

    const { thumbnailUrl } = clip;

    const url = new URL(thumbnailUrl);
    const sourceUrl = url.pathname.split("/").slice(1, -1);
    const segmentedClip = url.pathname.split("/").pop()?.split("-");

    if (!segmentedClip) return null;

    const previewIndex = segmentedClip.findIndex((s) => s === "preview");
    const clipInternalId = segmentedClip.slice(0, previewIndex).join("-");

    const clipSource = new URL(url.origin);
    clipSource.pathname = `${sourceUrl}/${clipInternalId}`;

    const clipSourceUrl = clipSource.toString();

    const clipData = {
      ...clip,
    };

    return {
      ...clipData[rawDataSymbol],
      fullhd: clipSourceUrl + ".mp4",
      hd: clipSourceUrl + "-720.mp4",
      sd: clipSourceUrl + "-480.mp4",
    };
  }
}
