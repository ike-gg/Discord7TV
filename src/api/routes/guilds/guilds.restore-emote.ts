import { DiscordAPIError, Guild, GuildEmoji, GuildMember } from "discord.js";
import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

import emoteOptimise from "@/emotes/emoteOptimise";
import getBufferFromUrl from "@/emotes/source/getBufferFromUrl";
import { optimizeBuffer } from "@/lib/buffer/optimize-buffer";

import { client } from "../../..";
import { db } from "../../../db";
import { removedEmotes } from "../../../db/schema";
import { TetraAPIError } from "../../TetraAPIError";

import { ApiConsole } from "#/loggers";

const getGuildParams = z.object({
  guildId: z.string(),
  restoreId: z.string(),
});

export const guildsRestoreEmote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { guildId, restoreId } = getGuildParams.parse(req.params);

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

    const removedEmote = await db.query.removedEmotes.findFirst({
      where: eq(removedEmotes.id, Number(restoreId)),
      with: {
        emote: true,
      },
    });

    if (!removedEmote || !removedEmote.emote) {
      throw new TetraAPIError(404, "Emote not found", "EMOTE_NOT_FOUND");
    }

    const { emote } = removedEmote;

    const emoteBuffer = await getBufferFromUrl(emote.url);
    const optimizedBuffer = await optimizeBuffer(emoteBuffer);

    const createdEmote = await guild.emojis.create({
      attachment: optimizedBuffer,
      name: emote.name,
    });

    await db.delete(removedEmotes).where(eq(removedEmotes.id, Number(restoreId)));

    res.json({ message: `Emote ${createdEmote.name} restored in ${guild.name}!` });
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
