import "server-only";

import { z } from "zod";

import { getServerEnv } from "@/lib/env/server";
import type { NormalizedVideo } from "@/lib/providers/types";

const youtubeSearchResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.object({ videoId: z.string() }),
      snippet: z.object({
        title: z.string(),
        channelId: z.string(),
        channelTitle: z.string(),
        publishedAt: z.string(),
        thumbnails: z
          .object({
            high: z.object({ url: z.string() }).optional(),
            medium: z.object({ url: z.string() }).optional(),
            default: z.object({ url: z.string() }).optional(),
          })
          .optional(),
      }),
    }),
  ),
});

export async function searchYouTubeVideos(
  query: string,
  maxResults = 20,
): Promise<NormalizedVideo[]> {
  const { YOUTUBE_API_KEY } = getServerEnv();
  if (!YOUTUBE_API_KEY) {
    throw new Error("YOUTUBE_API_KEY is not configured.");
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("order", "viewCount");
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", String(Math.min(maxResults, 50)));
  url.searchParams.set("key", YOUTUBE_API_KEY);

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`YouTube API request failed with ${response.status}.`);
  }

  const data = youtubeSearchResponseSchema.parse(await response.json());

  return data.items.map(({ id, snippet }) => ({
    externalId: id.videoId,
    title: snippet.title,
    channelExternalId: snippet.channelId,
    channelTitle: snippet.channelTitle,
    publishedAt: snippet.publishedAt,
    thumbnailUrl:
      snippet.thumbnails?.high?.url ??
      snippet.thumbnails?.medium?.url ??
      snippet.thumbnails?.default?.url ??
      null,
    sourceUrl: `https://www.youtube.com/watch?v=${id.videoId}`,
  }));
}
