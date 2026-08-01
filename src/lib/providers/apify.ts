import "server-only";

import { ApifyClient } from "apify-client";

import { getServerEnv } from "@/lib/env/server";

export async function runYouTubeEnrichmentActor(
  input: Record<string, unknown>,
) {
  const { APIFY_API_TOKEN, APIFY_YOUTUBE_ACTOR_ID } = getServerEnv();
  if (!APIFY_API_TOKEN || !APIFY_YOUTUBE_ACTOR_ID) {
    throw new Error("Apify is not configured.");
  }

  const client = new ApifyClient({ token: APIFY_API_TOKEN });
  const run = await client.actor(APIFY_YOUTUBE_ACTOR_ID).call(input);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  return { runId: run.id, items };
}
