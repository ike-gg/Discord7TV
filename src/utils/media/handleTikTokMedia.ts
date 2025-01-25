import sharp from "sharp";
import { PlatformResult } from "../../commands/media";
import { tetraTempDirectory } from "../../constants";
// import getTikTokVideo from "../getTikTokVideo";
import getBufferFromUrl from "../../emotes/source/getBufferFromUrl";
//@ts-ignore
import videoshow from "videoshow";
import * as fs from "fs";
import { FeedbackManager } from "../managers/FeedbackManager";
import fetch from "node-fetch";
import { getTikTokPost } from "../getTikTokPost";

export const handleTikTokMedia = async (
  _url: string,
  feedback: FeedbackManager
): Promise<PlatformResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      const tempDirPath = tetraTempDirectory(feedback.interaction.id);

      const post = await getTikTokPost(_url);

      if ("images" in post && post.images.length > 0) {
        const imageSlides = post.images;
        const audioURL = post.music;

        const imgPaths = await Promise.all(
          imageSlides.map(async (imageURL, index) => {
            console.log(imageURL);
            const fileBuffer = await getBufferFromUrl(imageURL);
            console.log(fileBuffer);
            const imageTransformedBuffer = await sharp(fileBuffer)
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
        // if (audioURL) {
        //   const audioPath = `${tempDirPath}/audio.mp3`;
        //   const audioBuffer = await getBufferFromUrl(audioURL);
        //   fs.writeFileSync(audioPath, audioBuffer);
        // }
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
          // .audio(`${tempDirPath}/audio.mp3`)
          .save(`${tempDirPath}/final.mp4`)
          .on("start", (command: any) => {
            feedback.media({
              title: "Rendering slide TikTok...",
            });
          })
          .on("error", (err: any, stdout: any, stderr: any) => {
            console.log("Error: ", err);
            reject(new Error("Tiktok rendering failed."));
          })
          .on("end", async () => {
            const moviePath = `${tempDirPath}/final.mp4`;
            const movie = fs.readFileSync(moviePath);
            resolve({
              media: [
                {
                  source: movie,
                  type: "mp4",
                  size: movie.length,
                },
              ],
              metadata: {
                author: post.author,
              },
            });
          });
      } else if ("video" in post) {
        if (!post.video) {
          throw new Error("Tiktok video url not found.");
        }

        const request = await fetch(post.video, {
          method: "HEAD",
        });
        const headers = request.headers;
        const size = Number(headers.get("content-length"));

        resolve({
          media: [
            {
              source: post.video,
              type: "mp4",
              size,
            },
          ],
          metadata: {
            author: post.author,
          },
        });
      } else {
        reject(new Error("Tiktok not found. Media empty?"));
      }
    } catch (error) {
      reject(error);
    }
  });
};
