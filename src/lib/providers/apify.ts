import "server-only";

import { ApifyClient } from "apify-client";
import { z } from "zod";

import {
  apifyYouTubeActorInputSchema,
  apifyYouTubeDatasetItemSchema,
  type ApifyYouTubeActorInput,
  type ApifyYouTubeDatasetItem,
} from "@/lib/contracts/apify";
import { getServerEnv } from "@/lib/env/server";

type ApifyActorClient = {
  actor: (actorId: string) => {
    call: (input: unknown) => Promise<{
      id: string;
      status: string;
      defaultDatasetId: string;
    }>;
  };
  dataset: (datasetId: string) => {
    listItems: (options: { clean: boolean }) => Promise<{ items: unknown[] }>;
  };
};

export type ApifyYouTubeActorResult = {
  runId: string;
  datasetId: string;
  status: "SUCCEEDED";
  items: ApifyYouTubeDatasetItem[];
};

export async function runYouTubeEnrichmentActor(
  input: ApifyYouTubeActorInput,
  client?: ApifyActorClient,
): Promise<ApifyYouTubeActorResult> {
  const { APIFY_API_TOKEN, APIFY_ACTOR_ID } = getServerEnv();
  if (!APIFY_API_TOKEN || !APIFY_ACTOR_ID) {
    throw new Error("Apify is not configured.");
  }

  const parsedInput = apifyYouTubeActorInputSchema.parse(input);
  const apify = client ?? new ApifyClient({ token: APIFY_API_TOKEN });
  const run = await apify.actor(APIFY_ACTOR_ID).call(parsedInput);

  if (run.status !== "SUCCEEDED") {
    throw new Error(
      `Apify Actor run ${run.id} finished with status ${run.status}.`,
    );
  }

  const { items } = await apify
    .dataset(run.defaultDatasetId)
    .listItems({ clean: true });

  return {
    runId: run.id,
    datasetId: run.defaultDatasetId,
    status: "SUCCEEDED",
    items: z.array(apifyYouTubeDatasetItemSchema).parse(items),
  };
}
