import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { scrapeExternalResearchSource } from "@/lib/providers/firecrawl";

describe("scrapeExternalResearchSource", () => {
  it("requests bounded Markdown and normalizes source metadata", async () => {
    const scrape = vi.fn().mockResolvedValue({
      markdown: "# Creator research\n\nEvidence from the source.",
      metadata: {
        title: "Creator research",
        description: "A competitor positioning report.",
        sourceURL: "https://example.com/reports/creator",
        publishedTime: "2026-07-15T10:00:00Z",
      },
    });

    const result = await scrapeExternalResearchSource(
      "https://example.com/reports/creator?ref=growth",
      { scrape },
    );

    expect(scrape).toHaveBeenCalledWith(
      "https://example.com/reports/creator?ref=growth",
      {
        formats: ["markdown"],
        onlyMainContent: true,
        timeout: 20_000,
      },
    );
    expect(result).toEqual({
      provider: "firecrawl",
      purpose: "supporting_web_research",
      sourceUrl: "https://example.com/reports/creator?ref=growth",
      resolvedUrl: "https://example.com/reports/creator",
      title: "Creator research",
      description: "A competitor positioning report.",
      markdown: "# Creator research\n\nEvidence from the source.",
      truncated: false,
      publishedAt: "2026-07-15T10:00:00Z",
    });
  });

  it("bounds large pages returned to the interactive tool", async () => {
    const scrape = vi.fn().mockResolvedValue({
      markdown: "x".repeat(25_001),
      metadata: { sourceURL: "https://example.com/large-report" },
    });

    const result = await scrapeExternalResearchSource(
      "https://example.com/large-report",
      { scrape },
    );

    expect(result.markdown).toHaveLength(25_000);
    expect(result.truncated).toBe(true);
  });

  it("rejects a cloud response without requested Markdown", async () => {
    const scrape = vi.fn().mockResolvedValue({
      metadata: { sourceURL: "https://example.com" },
    });

    await expect(
      scrapeExternalResearchSource("https://example.com", { scrape }),
    ).rejects.toThrow();
  });
});
