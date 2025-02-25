import sharp from "sharp";

import { maxEmoteSize } from "../constants";
import { AutoXGifsicle } from "../lib/buffer/AutoXGifsicle";
import { FeedbackManager } from "../utils/managers/FeedbackManager";

const emoteOptimise = async (
  emoteBuffer: Buffer,
  options: {
    animated: boolean;
    feedback?: FeedbackManager;
    transform?: "square" | "center";
    skipReducingFrames?: boolean;
  }
) => {
  const { animated, feedback, transform } = options;
  let processedBuffer: Buffer = emoteBuffer;

  await feedback?.warning("Processing your emote ⏳");

  if (!animated) {
    const buffer = sharp(processedBuffer, {
      animated: false,
    });
    const { height: _height, width: _width } = (await buffer.metadata()) as {
      width: number;
      height: number;
    };

    const side = Math.min(Math.max(_height, _width), 128);

    transform === "center" &&
      buffer.resize({
        fit: "cover",
        width: side,
        height: side,
      });
    transform === "square" &&
      buffer.resize({
        fit: "fill",
        width: side,
        height: side,
      });

    processedBuffer = await buffer.toBuffer();
  }

  if (animated) {
    const buffer = new AutoXGifsicle(processedBuffer, {
      lossy: 80,
      finalSize: maxEmoteSize,
      skipReducingFrames: options.skipReducingFrames,
    });

    transform === "center" && (await buffer.centerCrop());
    transform === "square" && (await buffer.stretchToFit());

    await buffer.optimize();

    console.table(buffer.actionLog);

    processedBuffer = buffer.fileBuffer;
  }

  return processedBuffer;
};

export default emoteOptimise;
