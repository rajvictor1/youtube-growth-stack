import { describe, expect, it } from "vitest";

import { agentToolRequestSchema } from "@/lib/contracts/agent-tools";

describe("agentToolRequestSchema", () => {
  it("accepts a bounded competitor research request", () => {
    const result = agentToolRequestSchema.safeParse({
      action: "start_competitor_research",
      payload: { query: "AI creator channels", maxCompetitors: 8 },
    });

    expect(result.success).toBe(true);
  });

  it("rejects an unbounded competitor count", () => {
    const result = agentToolRequestSchema.safeParse({
      action: "start_competitor_research",
      payload: { query: "AI creator channels", maxCompetitors: 500 },
    });

    expect(result.success).toBe(false);
  });

  it("validates optional Apify Actor input at the tool boundary", () => {
    const result = agentToolRequestSchema.safeParse({
      action: "start_competitor_research",
      payload: {
        query: "AI creator channels",
        maxCompetitors: 8,
        apify: {
          searchQueries: ["AI creator channels"],
          maxResults: 8,
          sortingOrder: "views",
          aiVideoDescription: false,
          aiVideoSummary: false,
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts a public web source for supporting research", () => {
    const result = agentToolRequestSchema.safeParse({
      action: "research_external_source",
      payload: { sourceUrl: "https://example.com/creator-report" },
    });

    expect(result.success).toBe(true);
  });

  it("rejects non-web protocols for external research", () => {
    const result = agentToolRequestSchema.safeParse({
      action: "research_external_source",
      payload: { sourceUrl: "file:///etc/passwd" },
    });

    expect(result.success).toBe(false);
  });

  it("rejects private-network sources", () => {
    const result = agentToolRequestSchema.safeParse({
      action: "research_external_source",
      payload: { sourceUrl: "http://192.168.1.10/channel-notes" },
    });

    expect(result.success).toBe(false);
  });
});
