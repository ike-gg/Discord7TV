import { NextFunction, Request, Response } from "express";
import { db } from "../../../db";
import { eq } from "drizzle-orm";
import { TetraAPIError } from "../../TetraAPIError";
import { discordOauth } from "../../..";
import { client } from "../../..";
import { Guild, GuildMember, Options, PermissionsBitField } from "discord.js";
import OAuth from "discord-oauth2";
import { users } from "../../../db/schema";
import { z } from "zod";
import { guildParsePremium } from "../../../utils/discord/guildParsePremium";

const getGuildQuerySchema = z.object({
  guildId: z.string(),
});

export const guildsGetGuild = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId } = getGuildQuerySchema.parse(req.params);

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

    const emotes = guild.emojis.cache.map((e) => e);
    const { emoteLimit, level } = guildParsePremium(guild);

    const animatedEmotes = emotes.filter((e) => e.animated).length;
    const staticEmotes = emotes.length - animatedEmotes;

    const stats = {
      animated: {
        used: animatedEmotes,
        limit: emoteLimit,
        free: Math.max(emoteLimit - animatedEmotes, 0),
      },
      static: {
        used: staticEmotes,
        limit: emoteLimit,
        free: Math.max(emoteLimit - staticEmotes, 0),
      },
    };

    const { name, banner, icon, id } = guild;

    res.json({
      name,
      banner,
      icon,
      id,
      level,
      emotes,
      stats,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new TetraAPIError(400, "Bad request", "INVALID_REQUEST_SCHEMA");
    } else {
      throw error;
    }
  }
};
