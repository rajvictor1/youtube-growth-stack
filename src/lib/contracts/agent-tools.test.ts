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
});
