import { NextFunction, Request, Response } from "express";
import { db } from "../../../db";
import { eq } from "drizzle-orm";
import { TetraAPIError } from "../../TetraAPIError";
import { discordOauth } from "../../..";
import { client } from "../../..";
import { Options, PermissionsBitField } from "discord.js";
import OAuth from "discord-oauth2";
import { users } from "../../../db/schema";

const transformGuildOauth = (guild: OAuth.PartialGuild) => {
  const { features, ...rest } = guild;
  return { ...rest };
};

export const guildsGetGuilds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await db.query.users.findFirst({
    where: eq(users.discord_id, req.user!.id),
  });

  if (!user)
    throw new TetraAPIError(
      500,
      "Internal Server Error",
      "AUTH_PASSED_USER_NOT_FOUND_ME_GET_GUILDS"
    );

  const userGuilds = await discordOauth.getUserGuilds(user.access_token);

  const tetraGuilds = await client.guilds.cache
    .filter((guild) => userGuilds.some((userGuild) => userGuild.id === guild.id))
    .map((guild) => guild.id);

  const guildsWithoutTetra = userGuilds.filter(
    (guild) => !tetraGuilds.includes(guild.id)
  );
  const guildsWithTetra = userGuilds.filter((guild) => tetraGuilds.includes(guild.id));

  // console.log(
  //   "Guilds tetra + user",
  //   guildsWithTetra.map((g) => g.name),
  //   guildsWithTetra.map((g) => g.permissions)
  // );

  const guildsWithBot = guildsWithTetra
    .filter((guild) => {
      const userPermissions = new PermissionsBitField(BigInt(guild.permissions!));
      return !userPermissions.has("ManageGuildExpressions");
    })
    .map(transformGuildOauth);

  const guildsWithUserPermissions = guildsWithTetra
    .filter((guild) => {
      const userPermissions = new PermissionsBitField(BigInt(guild.permissions!));
      return userPermissions.has("ManageGuildExpressions");
    })
    .map(transformGuildOauth);

  const guildsWithoutBotAvailableToAdd = guildsWithoutTetra
    .filter((guild) => {
      const userPermissions = new PermissionsBitField(BigInt(guild.permissions!));
      return userPermissions.has("ManageGuild");
    })
    .map(transformGuildOauth);

  res.json({
    guildsWithBot,
    guildsWithUserPermissions,
    guildsWithoutBotAvailableToAdd,
  });
};
