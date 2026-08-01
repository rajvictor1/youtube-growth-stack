import { describe, expect, it } from "vitest";

import {
  agentToolRequestSchema,
  agentToolResultSchemas,
} from "@/lib/contracts/agent-tools";

describe("agentToolRequestSchema", () => {
  const projectId = "11111111-1111-4111-8111-111111111111";
  const approval = {
    approved: true as const,
    approvedAt: "2026-08-01T08:00:00.000Z",
  };

  it("accepts a bounded competitor research request", () => {
    const result = agentToolRequestSchema.safeParse({
      action: "start_competitor_research",
      payload: {
        projectId,
        query: "AI creator channels",
        maxCompetitors: 8,
        approval,
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects an unbounded competitor count", () => {
    const result = agentToolRequestSchema.safeParse({
      action: "start_competitor_research",
      payload: {
        projectId,
        query: "AI creator channels",
        maxCompetitors: 500,
        approval,
      },
    });

    expect(result.success).toBe(false);
  });

  it("validates optional Apify Actor input at the tool boundary", () => {
    const result = agentToolRequestSchema.safeParse({
      action: "start_competitor_research",
      payload: {
        projectId,
        query: "AI creator channels",
        maxCompetitors: 8,
        approval,
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

  it("rejects a tool result that overstates a queued research job", () => {
    const result = agentToolResultSchemas.start_competitor_research.safeParse({
      id: crypto.randomUUID(),
      status: "completed",
      provider: "supabase",
      message: "Finished",
      input: { projectId, query: "AI creator channels", maxCompetitors: 8 },
    });

    expect(result.success).toBe(false);
  });

  it("accepts a validated Firecrawl completion result", () => {
    const result = agentToolResultSchemas.research_external_source.safeParse({
      status: "completed",
      document: {
        provider: "firecrawl",
        purpose: "supporting_web_research",
        sourceUrl: "https://example.com/research",
        resolvedUrl: "https://example.com/research",
        title: "Research",
        description: null,
        markdown: "Evidence",
        truncated: false,
        publishedAt: null,
      },
    });

    expect(result.success).toBe(true);
  });

  it("accepts the explicit not-saved persistence result", () => {
    const result = agentToolResultSchemas.save_content_idea.safeParse({
      saved: false,
      reason: "Persistence is not configured.",
      idea: { title: "A grounded idea", angle: "Explain the evidence" },
    });

    expect(result.success).toBe(true);
  });
});
