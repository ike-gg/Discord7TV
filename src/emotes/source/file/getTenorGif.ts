import fetch from "node-fetch";

import { env } from "../../../env";
import { Emote } from "../../../types";

interface TenorResponseObject {
  results: {
    media_formats: {
      tinygif?: {
        url: string;
      };
    };
  }[];
}

const getTenorGif = async (tenorGifUrl: string): Promise<Emote> => {
  const gifPaths = tenorGifUrl.split("/").at(-1);

  if (!gifPaths) throw new Error("Wrong gif id.");

  const gifId = gifPaths.split("-").at(-1);

  if (!gifId || !Number(gifId)) throw new Error("Wrong gif id.");

  const params = new URLSearchParams({
    key: env.TENOR_API_KEY,
    ids: gifId,
    media_filter: "tinygif",
  });
  const paramsString = params.toString();

  try {
    const response = await fetch("https://tenor.googleapis.com/v2/posts?" + paramsString);

    if (!response.ok) throw new Error("Tenor API request failed (TENOR_NOT_OK)");

    const tenorGifData = (await response.json()) as TenorResponseObject;

    if (
      tenorGifData.results.length === 0 ||
      !tenorGifData.results[0].media_formats.tinygif
    )
      throw new Error("Tenor API missing media (TENOR_EMPTY_OBJECT)");

    const emoteSource = tenorGifData.results[0].media_formats.tinygif.url;

    return {
      animated: true,
      author: "Tenor GIF",
      file: {
        preview: emoteSource,
        url: emoteSource,
      },
      id: gifId,
      name: "Emote name",
      origin: "tenor",
    };
  } catch (error) {
    throw new Error(String(error));
  }
};

export default getTenorGif;
