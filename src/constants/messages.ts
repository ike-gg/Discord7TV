import { GuildEmoji } from "discord.js";
import prettyBytes from "pretty-bytes";

import { maxEmoteSize } from ".";
import { supportedMediaPlatforms } from "../commands/media";
import { TetraEmbedContent } from "../utils/embedMessages/TetraEmbed";
import multilineText from "../utils/multilineText";

type T = TetraEmbedContent;

const loadingEmotes = [
  "<a:tetraLoading:1165905111432839171>",
  "<a:tetraLoading:1165904467120627723>",
  "<a:tetraLoading:1165904251252391997>",
  "<a:tetraLoading:1165904242997985311>",
  "<a:tetraLoading:1165904168205156372>",
  "<a:tetraLoading:1165904037800050788>",
];

export const getRandomLoadingEmote = () =>
  loadingEmotes[Math.floor(Math.random() * loadingEmotes.length)];

export class Messages {
  //generic
  static readonly INTERACTION_TIMEOUT: T =
    "This interaction has timed out. Please create a new one.";
  static WORKING(): T {
    return {
      title: "Working on it...",
      description: getRandomLoadingEmote(),
    };
  }
  static readonly RATE_LIMIT_EXCEEDED: T =
    "The bot is rate limited. The action will be automatically carried out once the limit expires.";
  static readonly EMOTE_NOT_FOUND: T = "Emote(s) not found.";
  static readonly MISSING_PERMISSIONS: T = {
    title: "Permissions",
    description: "You don't have sufficient permissions to use this command.",
  };
  static readonly INVALID_REFERENCE: T = "Invalid URL.";
  static readonly FILE_NOT_FOUND: T = "File not found.";
  static readonly URL_NOT_FOUND: T = "URL not found.";

  //emote case
  static readonly MULTIPLE_EMOTES_NOT_SUPPORTED: T = {
    title: "Not supported",
    description: "Multiple emotes are not currently supported.",
  };

  //guilds case
  static readonly NO_COMMON_SERVERS_PERMISSIONS: T =
    "No common servers found where you have permissions";

  //special
  static readonly NEW_MEDIA_COMMAND: T = {
    title: "Command deprecated.",
    description: `Use \`/media\` command instead.
    
    \`/media\` command combines multiple commands (\`/instagram\`, \`/tiktok\`, \`/twitter\` etc.) into one.
    `,
  };

  //media
  static readonly METDIA_PLATFORM_NOT_SUPPORED: T = {
    title: "Platform not supported",
    description: `Currently supported platforms:
${supportedMediaPlatforms.map((media) => `- ${media.name} (${media.hostnames.join(", ")})`).join("\n")}`,
  };

  //twitch case
  static readonly CHANNEL_NOT_FOUND: T = "Channel not found.";

  //interactive
  static ADDED_EMOTE(emote: GuildEmoji): T {
    return {
      title: "Success!",
      description: `Added \`${emote.name}\` emote ${emote} in \`${emote.guild.name}\``,
      image: {
        url: emote.url,
      },
    };
  }

  static EXCEEDED_EMOTE_SIZE(size: number): T {
    const maxSize = prettyBytes(maxEmoteSize);
    const emoteSize = prettyBytes(size);
    const differenceSize = prettyBytes(size - maxEmoteSize);

    return {
      description: multilineText(
        "Emote exceeded maximum size.",
        `**${emoteSize}** / ${maxSize} *(exceeds by ${differenceSize})*`,
        " ",
        "Choose the optimization method."
      ),
    };
  }

  static ANNOUNCE_ADDED_EMOTE(emote: GuildEmoji): string {
    return `Someone just added an emote ${emote} to their server!`;
  }

  static ANNOUNCE_ADDED_MULTIPLE_EMOTES(emote: GuildEmoji[]): string {
    return `Someone just added multiple emotes ${emote.join()} to their server!`;
  }

  static ANNOUNCE_ADDED_EMOTE_PANEL(emote: GuildEmoji): string {
    return `> Someone just added an emote ${emote} to their server using **Tetra Panel**!`;
  }
}
