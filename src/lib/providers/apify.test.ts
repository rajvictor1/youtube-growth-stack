// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { runYouTubeEnrichmentActor } from "@/lib/providers/apify";

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
    process.env.APIFY_API_TOKEN = originalToken;
    process.env.APIFY_ACTOR_ID = originalActorId;
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

  it("does not report a failed Actor run as successful", async () => {
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
        client,
      ),
    ).rejects.toThrow("finished with status FAILED");
    expect(client.dataset).not.toHaveBeenCalled();
  });
});
