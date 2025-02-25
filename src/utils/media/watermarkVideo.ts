import { randomUUID } from "crypto";
import ffmpeg from "ffmpeg";
import * as fs from "fs";
import path from "path";

import { TempFileManager } from "#/files/temp-file-manager";

export const watermarkVideo = async (video: Buffer, id: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const pid = randomUUID();
    const tempDir = TempFileManager.create();
    const videoPath = `${tempDir}/in${pid}.mp4`;
    const newVideoPath = `${tempDir}/out${pid}.mp4`;

    const watermarkPath = path.resolve(__dirname, "./watermark.png");

    fs.writeFileSync(videoPath, video);

    try {
      new ffmpeg(videoPath, (err, video) => {
        if (!err) {
          video.fnAddWatermark(
            watermarkPath,
            newVideoPath,
            {
              position: "C",
            },
            (error, file) => {
              if (!error) {
                const outputBuffer = fs.readFileSync(file);
                resolve(outputBuffer);
              } else {
                console.log(error);
                reject(new Error("Failed to watermark video"));
              }
            }
          );
        } else {
          reject(new Error("Failed to read video?"));
        }
      });
    } catch (error) {
      reject(new Error("FFMPEG failed."));
    }
  });
};
