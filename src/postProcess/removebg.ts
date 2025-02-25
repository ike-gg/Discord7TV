import { removeBackground } from "@imgly/background-removal-node";
import { ButtonInteraction } from "discord.js";
import fs from "fs";
import path from "path";

import editEmoteByUser from "../emotes/editEmoteByUser";
import { DiscordBot } from "../types";
import * as TaskTypes from "../types/TaskTypes";

import { TempFileManager } from "#/files/temp-file-manager";

export default async function removebg(
  interaction: ButtonInteraction,
  client: DiscordBot,
  taskId: string
) {
  try {
    await interaction.deferUpdate();

    const taskDetails = client.tasks.getTask<TaskTypes.PostProcessEmote>(taskId);

    const { feedback } = taskDetails;

    await feedback.removeComponents();
    await feedback.working();

    const { emote } = taskDetails;

    const tempDir = TempFileManager.create();
    const tempFile = path.join(tempDir, "emote.png");
    fs.writeFileSync(tempFile, emote.data);

    const editedEmote = await removeBackground(tempFile, {
      model: "medium",
    });

    const arrayBuffer = await editedEmote.arrayBuffer();
    const editedEmoteBuffer = Buffer.from(arrayBuffer);

    client.tasks.updateTask<TaskTypes.PostProcessEmote>(taskId, {
      ...taskDetails,
      emote: {
        ...taskDetails.emote,
        finalData: editedEmoteBuffer,
        slices: undefined,
      },
    });

    editEmoteByUser(taskId);
  } catch (error) {
    throw new Error(String(error));
  }
}
