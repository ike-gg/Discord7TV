import prettyBytes from "pretty-bytes";
import sharp from "sharp";

import { maxEmoteSize } from "@/constants";
import { AutoXGifsicle } from "@/lib/buffer/AutoXGifsicle";
import { FittingOption } from "@/types";
import { FeedbackManager } from "@/utils/managers/FeedbackManager";

import { CoreConsole } from "#/loggers";

interface OptimizeBufferOptions {
  targetSize: number;
  feedback?: FeedbackManager;
  fitting?: FittingOption;
  skipReducingFrames?: boolean;
}

const defaultOptions: OptimizeBufferOptions = {
  targetSize: maxEmoteSize,
};

export const optimizeBuffer = async (
  entryBuffer: Buffer,
  options?: Partial<OptimizeBufferOptions>
) => {
  const { feedback, fitting, skipReducingFrames, targetSize } = {
    ...defaultOptions,
    ...options,
  };

  let processedBuffer: Buffer = entryBuffer;

  const needsOptimization = entryBuffer.byteLength > targetSize;

  await feedback?.warning("Processing your emote ⏳");

  const isAnimated = (await (await sharp(processedBuffer).metadata()).format) === "gif";

  if (!isAnimated) {
    const buffer = sharp(processedBuffer, {
      animated: false,
    });

    const { height: _height, width: _width } = (await buffer.metadata()) as {
      width: number;
      height: number;
    };

    const side = Math.min(Math.max(_height, _width), 128);

    fitting === "cover" &&
      buffer.resize({
        fit: "cover",
        width: side,
        height: side,
      });

    fitting === "fill" &&
      buffer.resize({
        fit: "fill",
        width: side,
        height: side,
      });

    processedBuffer = await buffer.toBuffer();
  }

  if (isAnimated) {
    const buffer = new AutoXGifsicle(processedBuffer, {
      lossy: 80,
      finalSize: targetSize,
      skipReducingFrames,
    });

    fitting === "cover" && (await buffer.centerCrop());
    fitting === "fill" && (await buffer.stretchToFit());

    needsOptimization && (await buffer.optimize());

    processedBuffer = buffer.fileBuffer;
  }

  CoreConsole.dev.info(
    "Optimized buffer from ",
    prettyBytes(entryBuffer.byteLength),
    " to ",
    prettyBytes(processedBuffer.byteLength)
  );

  return processedBuffer;
};
