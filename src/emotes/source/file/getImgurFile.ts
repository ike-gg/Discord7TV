import fetch from "node-fetch";

import { env } from "../../../env";
import { Emote } from "../../../types";

interface ImgurImageProperty {
  link: string;
  animated: boolean;
}

interface ImgurAlbumResponseObject {
  data: {
    images: ImgurImageProperty[];
  };
}

interface ImgurImageResponseObject {
  data: ImgurImageProperty;
}

type ImgurResponseObject = ImgurAlbumResponseObject | ImgurImageResponseObject;

const getImgurFile = async (imgurUrl: string): Promise<Emote> => {
  const imgurPath = imgurUrl.split("/").at(-1)!;
  const fileId = imgurPath.split(".").at(0);

  if (!fileId) throw new Error("Invalid imgur id file.");

  if (imgurUrl.includes("/gallery/"))
    throw new Error(
      "URL leads to gallery, please provide a direct link to image on imgur."
    );

  let imgurObject: "image" | "album" = "image";

  if (imgurUrl.includes("/a/")) imgurObject = "album";

  const response = await fetch(`https://api.imgur.com/3/${imgurObject}/${fileId}`, {
    headers: {
      Authorization: `Client-ID ${env.IMGUR_CLIENT_ID}`,
    },
  });

  if (!response.ok) throw new Error("Imgur API request failed (IMGUR_NOT_OK)");

  const imgurFileData = (await response.json()) as ImgurResponseObject;

  let imageDetails: ImgurImageProperty | null = null;

  if ("images" in imgurFileData.data) {
    imageDetails = imgurFileData.data.images[0];
  } else {
    imageDetails = imgurFileData.data;
  }

  if (!imageDetails) throw new Error("Source url to file not found. (EMPTY_OBJECT)");

  return {
    animated: imageDetails.animated,
    author: "Imgur",
    file: {
      preview: imageDetails.link,
      url: imageDetails.link,
    },
    id: fileId,
    name: "Emote name",
    origin: "imgur",
  };
};

export default getImgurFile;
