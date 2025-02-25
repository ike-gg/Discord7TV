import { Router } from "express";

import { guildsGetGuild } from "./guilds.get-guild";
import { guildsGetGuilds } from "./guilds.get-guilds";
import { guildsGetRemovedEmotes } from "./guilds.get-removed-emotes";
import { guildsPostEmote } from "./guilds.post-emote";
import { guildsRemoveEmote } from "./guilds.remove-emote";
import { guildsRestoreEmote } from "./guilds.restore-emote";

export const guildsRouter = Router();

guildsRouter.get("/", guildsGetGuilds);
guildsRouter.get("/:guildId", guildsGetGuild);

guildsRouter.post("/:guildId/emote", guildsPostEmote);

guildsRouter.get("/:guildId/removed", guildsGetRemovedEmotes);
guildsRouter.post("/:guildId/restore/:restoreId", guildsRestoreEmote);

guildsRouter.delete("/:guildId/emote/:emoteId", guildsRemoveEmote);
