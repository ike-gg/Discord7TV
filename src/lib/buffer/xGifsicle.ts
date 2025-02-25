import prettyBytes from "pretty-bytes";
import sharp from "sharp";

import { execBunBuffer, execBunBufferSymbol } from "./x-gifsicle-support";

const isGif = require("is-gif");
const xgifsicle = require("gifsicle");

export type Arguments = (string | number | Symbol)[];
export type FrameDimensions = {
  width: number;
  height: number;
};
export type CroppingPoints = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type ActionLog = Awaited<ReturnType<xGifsicle["metadata"]>> & {
  action: string;
};

interface ProcessOptions {
  saveToBuffer?: boolean;
}

export class xGifsicle {
  public fileBuffer: Buffer;
  private staticArgs: Arguments = [];
  public actionLog: ActionLog[] = [];

  get size() {
    return this.fileBuffer.byteLength;
  }

  get prettySize() {
    return prettyBytes(this.size);
  }

  constructor(gifBuffer: Buffer) {
    if (!Buffer.isBuffer(gifBuffer) || !isGif(gifBuffer)) {
      throw new Error("Invalid input");
    }
    this.fileBuffer = gifBuffer;
  }

  async stretchToFit() {
    const { height } = await this.metadata();
    const args: Arguments = ["--resize", `${height}x${height}`];
    await this.process(args);
    return this;
  }

  async centerCrop() {
    await this.crop(({ height, width }) => {
      const size = Math.min(height, width);
      const x1 = Math.floor((width - size) / 2);
      const y1 = Math.floor((height - size) / 2);
      const x2 = x1 + size;
      const y2 = y1 + size;

      return {
        x1,
        y1,
        x2,
        y2,
      };
    });
  }

  async lossy(lossyFactor: number) {
    const args: Arguments = [`--lossy=${lossyFactor}`];
    await this.process(args);
    return this;
  }

  async colors(colorsFactor: number) {
    // const args: Arguments = ["--colors", colorsFactor];
    this.staticArgs = ["--colors", colorsFactor];
    await this.process([]);
    return this;
  }

  async crop(
    croppingFn: (frameDimensions: FrameDimensions) => CroppingPoints
  ): Promise<xGifsicle>;
  async crop(cropping: CroppingPoints): Promise<xGifsicle>;
  async crop(
    croppingOrFn: CroppingPoints | ((frameDimensions: FrameDimensions) => CroppingPoints)
  ): Promise<xGifsicle> {
    let croppingString: string;

    if (typeof croppingOrFn === "function") {
      const { width, height } = await this.metadata();
      const { x1, x2, y1, y2 } = croppingOrFn({
        width,
        height,
      });
      croppingString = `${x1},${y1}-${x2},${y2}`;
    } else {
      const { x1, x2, y1, y2 } = croppingOrFn;
      croppingString = `${x1},${y1}-${x2},${y2}`;
    }

    const args: Arguments = ["--crop", croppingString];

    await this.process([], args);
    return this;
  }

  async scale(scaleFactor: number) {
    const args: Arguments = ["--scale", scaleFactor];
    await this.process(args);
    return this;
  }

  async cut(cut: [number, number]): Promise<xGifsicle>;
  async cut(cutFn: (totalFrames: number) => [number, number]): Promise<xGifsicle>;
  async cut(
    cutArrayOrFn: [number, number] | ((totalFrames: number) => [number, number])
  ): Promise<xGifsicle> {
    let cutString: string;

    if (typeof cutArrayOrFn === "function") {
      const { frames } = await this.metadata();
      const timestamps = cutArrayOrFn(frames);
      const safeTimestamps = timestamps.map((number) => Math.floor(number));
      cutString = `#${safeTimestamps[0]}-${safeTimestamps[1]}`;
    } else {
      const safeTimestamps = cutArrayOrFn.map((number) => Math.floor(number));
      cutString = `#${safeTimestamps[0]}-${safeTimestamps[1]}`;
    }

    const args: Arguments = ["--delete", cutString, "--done"];

    await this.process(args, ["-U"]);
    return this;
  }

  async frameRate(delayFactor: number) {
    const { frames, delay } = await this.metadata();

    const args: Arguments = [];

    const newDelay = Math.round(delay * delayFactor);
    for (let x = 0; x <= frames; x += delayFactor) {
      args.push(`--delay`);
      args.push(newDelay);
      args.push(`#${Math.round(x)}`);
    }

    await this.process(args, ["-U"]);
    return this;
  }

  async metadata() {
    const metadata = await sharp(this.fileBuffer, {
      animated: true,
    }).metadata();

    const delay = metadata.delay![0] / 10;
    const frames = metadata.pages!;
    const height = metadata.height! / frames;
    const width = metadata.width!;
    const duration = frames * delay;
    const fps = Math.round(1 / (delay / 100));
    const { size, prettySize } = this;

    return {
      delay,
      frames,
      height,
      width,
      duration,
      fps,
      size,
      prettySize,
    };
  }

  protected async process(
    _args: Arguments,
    _argsBeforeInput: Arguments = [],
    options: ProcessOptions = {
      saveToBuffer: true,
    }
  ): Promise<Buffer> {
    const args: Arguments = [
      "--no-warnings",
      ..._argsBeforeInput,
      // execBuffer.input,

      execBunBufferSymbol.input,
      ..._args,
      ...this.staticArgs,
      "-O3",
      "-o",
      // execBuffer.output,

      execBunBufferSymbol.output,
    ];

    try {
      // const newBuffer = await execBuffer({
      //   input: this.fileBuffer,
      //   bin: xgifsicle,
      //   args,
      // });
      const newBuffer = await execBunBuffer({
        input: this.fileBuffer,
        bin: xgifsicle,
        args,
      });
      if (options.saveToBuffer) {
        this.fileBuffer = newBuffer;
        this.actionLog.push({
          ...(await this.metadata()),
          action: [..._argsBeforeInput, ..._args, ...this.staticArgs]
            .splice(0, 5)
            .join(", "),
        });
      }
      return newBuffer;
    } catch (err: any) {
      console.log(err);
      err.message = err.stderr || err.message;
      throw new Error(err);
    }
  }
}
