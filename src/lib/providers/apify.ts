import "server-only";

import { ApifyClient } from "apify-client";
import { z } from "zod";

import {
  apifyYouTubeActorInputSchema,
  apifyYouTubeDatasetItemSchema,
  apifyYouTubeExecutionFailureSchema,
  apifyYouTubeRunReferenceSchema,
  type ApifyYouTubeActorInput,
  type ApifyYouTubeDatasetItem,
  type ApifyYouTubeExecutionFailure,
  type ApifyYouTubeExecutionFailureCode,
  type ApifyYouTubeRunReference,
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

export type ApifyYouTubeActorOptions = {
  resumeFrom?: ApifyYouTubeRunReference;
};

export class ApifyYouTubeExecutionError extends Error {
  readonly code: ApifyYouTubeExecutionFailureCode;
  readonly retryable: boolean;
  readonly runId?: string;
  readonly datasetId?: string;
  readonly actorStatus?: string;

  constructor(failure: ApifyYouTubeExecutionFailure, options?: ErrorOptions) {
    super(failure.message, options);
    this.name = "ApifyYouTubeExecutionError";
    this.code = failure.code;
    this.retryable = failure.retryable;
    this.runId = failure.runId;
    this.datasetId = failure.datasetId;
    this.actorStatus = failure.actorStatus;
  }

  toFailure(): ApifyYouTubeExecutionFailure {
    return apifyYouTubeExecutionFailureSchema.parse({
      code: this.code,
      message: this.message,
      retryable: this.retryable,
      ...(this.runId ? { runId: this.runId } : {}),
      ...(this.datasetId ? { datasetId: this.datasetId } : {}),
      ...(this.actorStatus ? { actorStatus: this.actorStatus } : {}),
    });
  }
}

export function getApifyYouTubeExecutionFailure(
  error: unknown,
): ApifyYouTubeExecutionFailure {
  if (error instanceof ApifyYouTubeExecutionError) {
    return error.toFailure();
  }

  return {
    code: "PROVIDER_ERROR",
    message: "The Apify provider request failed.",
    retryable: true,
  };
}

/**
 * Worker-only execution boundary. The caller must load this input from a
 * durable job with persisted approval; this provider does not infer approval.
 */
export async function runYouTubeEnrichmentActor(
  input: ApifyYouTubeActorInput,
  options: ApifyYouTubeActorOptions = {},
  client?: ApifyActorClient,
): Promise<ApifyYouTubeActorResult> {
  let parsedInput: ReturnType<typeof apifyYouTubeActorInputSchema.parse>;
  let resumeFrom: ApifyYouTubeRunReference | undefined;

  try {
    parsedInput = apifyYouTubeActorInputSchema.parse(input);
    resumeFrom = options.resumeFrom
      ? apifyYouTubeRunReferenceSchema.parse(options.resumeFrom)
      : undefined;
  } catch (cause) {
    throw new ApifyYouTubeExecutionError(
      {
        code: "INVALID_INPUT",
        message: "The Apify YouTube job input is invalid.",
        retryable: false,
      },
      { cause },
    );
  }

  let env: ReturnType<typeof getServerEnv>;
  try {
    env = getServerEnv();
  } catch (cause) {
    throw new ApifyYouTubeExecutionError(
      {
        code: "CONFIGURATION_ERROR",
        message: "The server provider configuration is invalid.",
        retryable: false,
      },
      { cause },
    );
  }

  const { APIFY_API_TOKEN, APIFY_ACTOR_ID } = env;
  if (!APIFY_API_TOKEN || !APIFY_ACTOR_ID) {
    throw new ApifyYouTubeExecutionError({
      code: "CONFIGURATION_ERROR",
      message: "Apify is not configured.",
      retryable: false,
    });
  }

  const apify = client ?? new ApifyClient({ token: APIFY_API_TOKEN });
  let runReference = resumeFrom;

  if (!runReference) {
    let run: Awaited<ReturnType<ReturnType<ApifyActorClient["actor"]>["call"]>>;
    try {
      run = await apify.actor(APIFY_ACTOR_ID).call(parsedInput);
    } catch (cause) {
      throw new ApifyYouTubeExecutionError(
        {
          code: "PROVIDER_ERROR",
          message: "The Apify Actor request failed.",
          retryable: true,
        },
        { cause },
      );
    }

    if (run.status !== "SUCCEEDED") {
      throw new ApifyYouTubeExecutionError({
        code: "ACTOR_RUN_FAILED",
        message: `The Apify Actor run finished with status ${run.status}.`,
        retryable: true,
        runId: run.id,
        actorStatus: run.status,
      });
    }

    runReference = {
      runId: run.id,
      datasetId: run.defaultDatasetId,
    };
  }

  let items: unknown[];
  try {
    ({ items } = await apify
      .dataset(runReference.datasetId)
      .listItems({ clean: true }));
  } catch (cause) {
    throw new ApifyYouTubeExecutionError(
      {
        code: "PROVIDER_ERROR",
        message: "The Apify dataset request failed.",
        retryable: true,
        ...runReference,
      },
      { cause },
    );
  }

  let parsedItems: ApifyYouTubeDatasetItem[];
  try {
    parsedItems = z.array(apifyYouTubeDatasetItemSchema).parse(items);
  } catch (cause) {
    throw new ApifyYouTubeExecutionError(
      {
        code: "INVALID_DATASET",
        message: "The Apify dataset did not match the expected YouTube schema.",
        retryable: false,
        ...runReference,
      },
      { cause },
    );
  }

  return {
    ...runReference,
    status: "SUCCEEDED",
    items: parsedItems,
  };
}
