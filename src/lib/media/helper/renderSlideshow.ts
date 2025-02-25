import fs from "fs";
import path from "path";
import sharp from "sharp";
//@ts-expect-error - videoshow is not typed
import videoshow from "videoshow";

import { EmbeddedError } from "../../../constants/errors";

import { TempFileManager } from "#/files/temp-file-manager";

export const renderSlideshow = async (
  images: Buffer[],
  audio?: Buffer
): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    const tempDirPath = TempFileManager.create();

    const imgPaths = await Promise.all(
      images.map(async (image, index) => {
        const imageTransformedBuffer = await sharp(image)
          .jpeg()
          .resize({
            height: 960,
            width: 540,
            fit: "contain",
          })
          .toBuffer();
        const path = `${tempDirPath}/${index}.jpeg`;
        fs.writeFileSync(path, imageTransformedBuffer);
        return path;
      })
    );

    const audioPath = `${tempDirPath}/audio.mp3`;

    if (audio) {
      fs.writeFileSync(audioPath, audio);
    }

    if (!audio) {
      const blankAudioPath = path.resolve(__dirname, "./blank.mp3");
      const blankAudio = fs.readFileSync(blankAudioPath);
      fs.writeFileSync(audioPath, blankAudio);
    }

    videoshow(imgPaths, {
      fps: 15,
      loop: 3,
      videoBitrate: 512,
      transition: false,
      transitionDuration: 0.2, // seconds
      videoCodec: "libx264",
      size: "540x960",
      audioBitrate: "64k",
      audioChannels: 1,
      format: "mp4",
      pixelFormat: "yuv420p",
    })
      .audio(`${tempDirPath}/audio.mp3`)
      .save(`${tempDirPath}/final.mp4`)
      .on("error", (err: any, stdout: any, stderr: any) => {
        console.log(err, stdout);
        reject(new EmbeddedError("Error occurred while rendering slideshow"));
      })
      .on("end", async () => {
        const moviePath = `${tempDirPath}/final.mp4`;
        const movie = fs.readFileSync(moviePath);

        resolve(movie);
      });
  });
};
