import { NextFunction, Request, Response } from "express";
import { client, discordOauth } from "../..";
import { PrismaClient } from "@prisma/client";
import * as z from "zod";
import { TetraAPIError } from "../TetraAPIError";
import { TetraEmbed } from "../../utils/embedMessages/TetraEmbed";
import { Messages } from "../../constants/messages";
import { announceUse } from "../../utils/managers/FeedbackManager";

const schema = z.object({
  emote: z.string().refine((value) => value.length % 4),
  guildId: z.string(),
  name: z
    .string()
    .refine(
      (value) => /^[a-zA-Z0-9_]{2,32}$/.test(value),
      "Emote names can only contain alphanumeric characters and underscores."
    ),
});

export default async (req: Request, res: Response, next: NextFunction) => {
  const prisma = new PrismaClient();
  try {
    const accessToken = res.locals["accessToken"] as string;
    const taskId = req.params["taskid"];

    if (!taskId) throw new TetraAPIError(400, "Bad request, task missing.");

    const body = schema.safeParse(req.body);

    if (!body.success)
      throw new TetraAPIError(
        400,
        "Bad request, payload verification failed." + body.error.toString()
      );

    const { emote: emoteBase64, guildId, name } = body.data;

    const taskDetails = await prisma.manualAdjustment.findFirst({
      where: {
        id: taskId,
      },
    });

    if (!taskDetails) throw new TetraAPIError(400, "Bad request. Task not found.");

    const { accountId, channelId, messageId } = taskDetails;

    const currentUser = await discordOauth.getUser(accessToken);

    if (currentUser.id !== accountId)
      throw new TetraAPIError(401, "Not authorized. Mismatching user ids.");

    const guild = await client.guilds.fetch(guildId);

    const userInGuild = await guild.members.fetch(accountId);

    if (!userInGuild)
      throw new TetraAPIError(401, "Not authorized. Not found user in guild.");

    const hasPermissions = userInGuild.permissions.has("ManageEmojisAndStickers");

    if (!hasPermissions)
      throw new TetraAPIError(401, "Not authorized. Missing permissions in guild.");

    const addedEmote = await guild.emojis.create({
      attachment: emoteBase64,
      name: name,
    });
    await prisma.manualAdjustment.delete({
      where: {
        id: taskId,
      },
    });

    await announceUse(Messages.ANNOUNCE_ADDED_EMOTE_PANEL(addedEmote));

    if (messageId && channelId) {
      try {
        const channel = await client.channels.fetch(channelId);
        if (channel?.isDMBased() || !channel?.isTextBased()) return;
        const message = await channel.messages.fetch(messageId);
        await message.edit({
          embeds: [TetraEmbed.success(Messages.ADDED_EMOTE(addedEmote))],
          components: [],
        });
      } catch (error) {
        console.error("updating message failed", error);
      }
    }

    res.status(200).json({
      message: `Sucessfully added ${addedEmote.name} emote in ${guild.name}.`,
    });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};
