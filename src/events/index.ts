import { ClientEvents } from "discord.js";

import { guildEmojiDeleteHandler } from "./guild-emoji-delete";
import { interactionCreateHandler } from "./interaction-create";
import { readyHandler } from "./ready";

export type EventHandler<T extends keyof ClientEvents> = (
  ...args: ClientEvents[T]
) => void;

class ClientEventsMap extends Map<
  keyof ClientEvents,
  (...args: ClientEvents[keyof ClientEvents]) => void
> {
  set<K extends keyof ClientEvents>(
    key: K,
    value: (...args: ClientEvents[K]) => void
  ): this {
    return super.set(key, value as (...args: ClientEvents[keyof ClientEvents]) => void);
  }

  get<K extends keyof ClientEvents>(
    key: K
  ): ((...args: ClientEvents[K]) => void) | undefined {
    return super.get(key);
  }
}

export const clientEvents = new ClientEventsMap();

clientEvents.set("ready", readyHandler);
clientEvents.set("interactionCreate", interactionCreateHandler);
clientEvents.set("emojiDelete", guildEmojiDeleteHandler);
