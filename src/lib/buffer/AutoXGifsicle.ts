import { maxEmoteSize } from "../../constants";
import { Arguments, xGifsicle } from "./xGifsicle";

interface Stage {
  method: "scale" | "reduceFrames" | "colors";
  value: number;
}

const stagesOpt: Stage[] = [
  {
    method: "scale",
    value: 0.95,
  },
  {
    method: "colors",
    value: 192,
  },
  {
    method: "scale",
    value: 0.95,
  },
  {
    method: "reduceFrames",
    value: 1,
  },
  {
    method: "colors",
    value: 128,
  },
  {
    method: "scale",
    value: 0.95,
  },
  {
    method: "colors",
    value: 96,
  },
  {
    method: "scale",
    value: 0.95,
  },
  {
    method: "colors",
    value: 64,
  },
  {
    method: "scale",
    value: 0.95,
  },
  {
    method: "reduceFrames",
    value: 1,
  },
];

const stagesOptWithoutReducingFrames = stagesOpt.filter(
  (stage) => stage.method !== "reduceFrames"
);

interface AutoXGifsicleOptions {
  finalSize: number;
  lossy: number;
  skipReducingFrames: boolean;
}

const defaultOptions: AutoXGifsicleOptions = {
  finalSize: maxEmoteSize,
  lossy: 80,
  skipReducingFrames: false,
};

export class AutoXGifsicle extends xGifsicle {
  private finalSize: number;
  private lossyFactor: number;
  private skipReducingFrames: boolean;

  constructor(gifBuffer: Buffer, options?: Partial<AutoXGifsicleOptions>) {
    const { finalSize, lossy, skipReducingFrames } = {
      ...defaultOptions,
      ...options,
    };

    super(gifBuffer);
    this.finalSize = finalSize;
    this.lossyFactor = lossy;
    this.skipReducingFrames = skipReducingFrames;
  }

  private async checkLossy() {
    const args: Arguments = [`--lossy=${this.lossyFactor}`];
    return await this.process(args, [], {
      saveToBuffer: false,
    });
  }

  async isLossyFinal() {
    const predictBuffer = await this.checkLossy();
    if (predictBuffer.byteLength < this.finalSize) {
      return true;
    }
    return false;
  }

  async optimize() {
    let stage = 0;
    while (this.size > this.finalSize) {
      const internalStages = this.skipReducingFrames
        ? stagesOptWithoutReducingFrames
        : stagesOpt;

      const { method, value } = internalStages.at(stage) || {
        method: "scale",
        value: 0.95,
      };

      console.log("RUnning method: ", method, value);

      if (method === "colors") {
        await this.colors(value);
      }
      if (method === "reduceFrames") {
        const { fps } = await this.metadata();
        if (fps >= 30) await this.frameRate(2);
        else if (fps >= 25) await this.frameRate(1.75);
        else if (fps <= 20) await this.frameRate(1.5);
        else if (fps <= 15) await this.frameRate(1.25);
        else await this.frameRate(1.125);
      }
      if (method === "scale") await this.scale(value);

      if (stage >= 5) {
        const canLossyFinal = await this.isLossyFinal();
        if (canLossyFinal) {
          await this.lossy(this.lossyFactor);
        }
      }

      stage++;
    }
    return this;
  }
}
