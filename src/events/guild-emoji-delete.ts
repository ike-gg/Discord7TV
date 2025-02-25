import { Events } from "discord.js";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { EmoteOrigin, emotes, removedEmotes } from "@/db/schema";

import { EventHandler } from ".";

import { BotConsole } from "#/loggers";

export const guildEmojiDeleteHandler: EventHandler<Events.GuildEmojiDelete> = async (
  removedEmote
) => {
  const emote = await db.query.emotes.findFirst({
    where: eq(emotes.externalId, removedEmote.id),
    with: {
      removed: true,
    },
  });

  // if emote not found
  if (!emote) {
    const [insertedEmote] = await db
      .insert(emotes)
      .values({
        externalId: removedEmote.id,
        isAnimated: removedEmote.animated ?? false,
        name: removedEmote.name ?? "Emote",
        origin: EmoteOrigin.DISCORD,
        previewUrl: removedEmote.imageURL({
          extension: removedEmote.animated ? "gif" : "webp",
          size: 64,
        }),
        url: removedEmote.imageURL({
          extension: removedEmote.animated ? "gif" : "webp",
        }),
      })
      .returning();

    await db.insert(removedEmotes).values({
      deletedWithPanel: true,
      emoteId: insertedEmote.id,
      guildId: removedEmote.guild.id,
    });

    BotConsole.dev.success(
      `Removed emote ${removedEmote.name} from ${removedEmote.guild.name} guild was added to the database.`
    );

    return;
  }

  // if emote found but not assigned to the guild
  if (!emote.removed) {
    await db.insert(removedEmotes).values({
      deletedWithPanel: true,
      emoteId: emote.id,
      guildId: removedEmote.guild.id,
    });

    BotConsole.dev.success(
      `Removed emote ${removedEmote.name} from ${removedEmote.guild.name} guild was assigned to the database.`
    );

    return;
  }

  if (emote?.removed.guildId === removedEmote.guild.id) {
    BotConsole.dev.warn(
      `Deleted emote already in db. Skipping ${removedEmote.name} from ${removedEmote.guild.name} guild.`
    );

    return;
  }
};
