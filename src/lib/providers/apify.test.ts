// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  ApifyYouTubeExecutionError,
  getApifyYouTubeExecutionFailure,
  runYouTubeEnrichmentActor,
} from "@/lib/providers/apify";

const datasetItem = {
  id: "video-id",
  url: "https://www.youtube.com/watch?v=video-id",
  title: "A useful video",
  type: "video",
  viewCount: 123,
  date: "2026-07-01T00:00:00.000Z",
  likes: 10,
  channelName: "Example Channel",
  channelUrl: "https://www.youtube.com/channel/channel-id",
  channelId: "channel-id",
  numberOfSubscribers: 1_000,
  duration: "00:10:00",
  commentsCount: 2,
};

describe("runYouTubeEnrichmentActor", () => {
  const originalToken = process.env.APIFY_API_TOKEN;
  const originalActorId = process.env.APIFY_ACTOR_ID;

  beforeEach(() => {
    process.env.APIFY_API_TOKEN = "test-token";
    process.env.APIFY_ACTOR_ID = "test-actor";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalToken === undefined) delete process.env.APIFY_API_TOKEN;
    else process.env.APIFY_API_TOKEN = originalToken;
    if (originalActorId === undefined) delete process.env.APIFY_ACTOR_ID;
    else process.env.APIFY_ACTOR_ID = originalActorId;
  });

  it("returns only a completed, validated Actor dataset", async () => {
    const call = vi.fn().mockResolvedValue({
      id: "run-id",
      status: "SUCCEEDED",
      defaultDatasetId: "dataset-id",
    });
    const listItems = vi.fn().mockResolvedValue({ items: [datasetItem] });
    const client = {
      actor: vi.fn(() => ({ call })),
      dataset: vi.fn(() => ({ listItems })),
    };

    const result = await runYouTubeEnrichmentActor(
      { searchQueries: ["creator economy"], maxResults: 1 },
      {},
      client,
    );

    expect(result).toMatchObject({
      runId: "run-id",
      datasetId: "dataset-id",
      status: "SUCCEEDED",
      items: [datasetItem],
    });
    expect(call).toHaveBeenCalledWith(
      expect.objectContaining({
        searchQueries: ["creator economy"],
        maxResults: 1,
        aiVideoDescription: false,
        aiVideoSummary: false,
      }),
    );
    expect(listItems).toHaveBeenCalledWith({ clean: true });
  });

  it("classifies a failed Actor run as retryable without a resume dataset", async () => {
    const client = {
      actor: vi.fn(() => ({
        call: vi.fn().mockResolvedValue({
          id: "failed-run",
          status: "FAILED",
          defaultDatasetId: "dataset-id",
        }),
      })),
      dataset: vi.fn(),
    };

    await expect(
      runYouTubeEnrichmentActor(
        { searchQueries: ["creator economy"], maxResults: 1 },
        {},
        client,
      ),
    ).rejects.toMatchObject({
      code: "ACTOR_RUN_FAILED",
      retryable: true,
      runId: "failed-run",
      datasetId: undefined,
      actorStatus: "FAILED",
    });
    expect(client.dataset).not.toHaveBeenCalled();
  });

  it("returns a terminal sanitized failure for invalid input", async () => {
    const failure = await runYouTubeEnrichmentActor({
      searchQueries: [],
      maxResults: 0,
    }).catch(getApifyYouTubeExecutionFailure);

    expect(failure).toEqual({
      code: "INVALID_INPUT",
      message: "The Apify YouTube job input is invalid.",
      retryable: false,
    });
  });

  it("returns a terminal failure when Apify is not configured", async () => {
    delete process.env.APIFY_API_TOKEN;

    const failure = await runYouTubeEnrichmentActor({
      searchQueries: ["creator economy"],
      maxResults: 1,
    }).catch(getApifyYouTubeExecutionFailure);

    expect(failure).toEqual({
      code: "CONFIGURATION_ERROR",
      message: "Apify is not configured.",
      retryable: false,
    });
  });

  it("carries completed run IDs on retryable dataset failures", async () => {
    const client = {
      actor: vi.fn(() => ({
        call: vi.fn().mockResolvedValue({
          id: "completed-run",
          status: "SUCCEEDED",
          defaultDatasetId: "completed-dataset",
        }),
      })),
      dataset: vi.fn(() => ({
        listItems: vi
          .fn()
          .mockRejectedValue(new Error("private provider error")),
      })),
    };

    const failure = await runYouTubeEnrichmentActor(
      { searchQueries: ["creator economy"], maxResults: 1 },
      {},
      client,
    ).catch(getApifyYouTubeExecutionFailure);

    expect(failure).toEqual({
      code: "PROVIDER_ERROR",
      message: "The Apify dataset request failed.",
      retryable: true,
      runId: "completed-run",
      datasetId: "completed-dataset",
    });
    expect(JSON.stringify(failure)).not.toContain("private provider error");
  });

  it("resumes dataset retrieval without starting another paid Actor run", async () => {
    const actor = vi.fn();
    const listItems = vi.fn().mockResolvedValue({ items: [datasetItem] });
    const client = {
      actor,
      dataset: vi.fn(() => ({ listItems })),
    };

    const result = await runYouTubeEnrichmentActor(
      { searchQueries: ["creator economy"], maxResults: 1 },
      { resumeFrom: { runId: "existing-run", datasetId: "existing-dataset" } },
      client,
    );

    expect(result).toMatchObject({
      runId: "existing-run",
      datasetId: "existing-dataset",
      status: "SUCCEEDED",
    });
    expect(actor).not.toHaveBeenCalled();
    expect(client.dataset).toHaveBeenCalledWith("existing-dataset");
  });

  it("classifies an invalid dataset as terminal and preserves resume IDs", async () => {
    const client = {
      actor: vi.fn(),
      dataset: vi.fn(() => ({
        listItems: vi
          .fn()
          .mockResolvedValue({ items: [{ title: "incomplete" }] }),
      })),
    };

    const failure = await runYouTubeEnrichmentActor(
      { searchQueries: ["creator economy"], maxResults: 1 },
      { resumeFrom: { runId: "existing-run", datasetId: "existing-dataset" } },
      client,
    ).catch(getApifyYouTubeExecutionFailure);

    expect(failure).toEqual({
      code: "INVALID_DATASET",
      message: "The Apify dataset did not match the expected YouTube schema.",
      retryable: false,
      runId: "existing-run",
      datasetId: "existing-dataset",
    });
  });

  it("sanitizes unknown errors into retryable provider failures", () => {
    expect(getApifyYouTubeExecutionFailure(new Error("secret detail"))).toEqual(
      {
        code: "PROVIDER_ERROR",
        message: "The Apify provider request failed.",
        retryable: true,
      },
    );
  });

  it("exposes structured failures without their internal cause", () => {
    const error = new ApifyYouTubeExecutionError(
      {
        code: "PROVIDER_ERROR",
        message: "The Apify provider request failed.",
        retryable: true,
      },
      { cause: new Error("private provider detail") },
    );

    expect(error.toFailure()).toEqual({
      code: "PROVIDER_ERROR",
      message: "The Apify provider request failed.",
      retryable: true,
    });
  });
});
