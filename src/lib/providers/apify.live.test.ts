// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { runYouTubeEnrichmentActor } from "@/lib/providers/apify";

const liveTest = process.env.RUN_LIVE_APIFY_TEST === "1" ? it : it.skip;

describe("Apify YouTube Actor live contract", () => {
  liveTest(
    "completes a minimal run and validates its dataset",
    async () => {
      const result = await runYouTubeEnrichmentActor({
        searchQueries: ["OpenAI Codex official"],
        maxResults: 1,
        maxResultsShorts: 0,
        maxResultStreams: 0,
        startUrls: [],
        downloadSubtitles: false,
        aiVideoDescription: false,
        aiVideoSummary: false,
      });

      expect(result.status).toBe("SUCCEEDED");
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: expect.any(String),
        url: expect.stringContaining("youtube.com/"),
        title: expect.any(String),
        channelId: expect.any(String),
      });
      expect(
        result.items[0].viewCount === null ||
          typeof result.items[0].viewCount === "number",
      ).toBe(true);
    },
    180_000,
  );
});
