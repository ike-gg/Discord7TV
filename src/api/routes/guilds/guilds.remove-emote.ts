import { DiscordAPIError, Guild, GuildEmoji, GuildMember } from "discord.js";
import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { client } from "../../..";
import { db } from "../../../db";
import { EmoteOrigin, emotes, removedEmotes, users } from "../../../db/schema";
import { TetraAPIError } from "../../TetraAPIError";

const getGuildParams = z.object({
  guildId: z.string(),
  emoteId: z.string(),
});

export const guildsRemoveEmote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { guildId, emoteId } = getGuildParams.parse(req.params);

    let guild: Guild;
    try {
      guild = await client.guilds.fetch(guildId);
    } catch {
      throw new TetraAPIError(
        404,
        "Guild not found",
        "GUILD_NOT_FOUND_UNKNOWN_GUILD_BOT"
      );
    }

    let member: GuildMember;
    try {
      member = await guild.members.fetch(req.user!.id);
    } catch {
      throw new TetraAPIError(
        404,
        "Guild not found",
        "GUILD_NOT_FOUND_UNKNOWN_GUILD_MEMBER"
      );
    }

    const hasPermissons = member.permissions.has("ManageGuildExpressions");

    if (!hasPermissons) {
      throw new TetraAPIError(403, "Missing permissions", "MISSING_PERMISSIONS");
    }

    let emote: GuildEmoji;
    try {
      emote = await guild.emojis.fetch(emoteId);
    } catch {
      throw new TetraAPIError(404, "Emote not found", "GUILD_EMOTE_NOT_FOUND");
    }

    const [insertedEmote] = await db
      .insert(emotes)
      .values({
        externalId: emote.id,
        isAnimated: emote.animated ?? false,
        name: emote.name ?? "Emote",
        origin: EmoteOrigin.DISCORD,
        previewUrl: emote.imageURL({
          extension: emote.animated ? "gif" : "webp",
          size: 64,
        }),
        url: emote.imageURL({
          extension: emote.animated ? "gif" : "webp",
        }),
      })
      .returning();

    await db.insert(removedEmotes).values({
      deletedWithPanel: true,
      emoteId: insertedEmote.id,
      guildId: guild.id,
    });

    try {
      await emote.delete();
    } catch {
      throw new TetraAPIError(400, "Failed to delete emote", "GUILD_EMOTE_DELETE_FAILED");
    }

    res.json({ message: `Emote ${emote.name} deleted from ${guild.name}` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new TetraAPIError(400, "Bad request", "INVALID_REQUEST_SCHEMA");
    } else if (error instanceof DiscordAPIError) {
      throw new TetraAPIError(400, error.message, "DISCORD_API_ERROR");
    } else {
      throw error;
    }
  }
};
