import "server-only";

import Firecrawl from "@mendable/firecrawl-js";

import { getServerEnv } from "@/lib/env/server";
import type { ExternalResearchDocument } from "@/lib/providers/types";

export async function scrapeExternalResearchSource(
  sourceUrl: string,
): Promise<ExternalResearchDocument> {
  const { FIRECRAWL_API_KEY } = getServerEnv();
  if (!FIRECRAWL_API_KEY) {
    throw new Error("FIRECRAWL_API_KEY is not configured.");
  }

  const firecrawl = new Firecrawl({ apiKey: FIRECRAWL_API_KEY });
  const document = await firecrawl.scrape(sourceUrl, {
    formats: ["markdown"],
    onlyMainContent: true,
  });

  return {
    sourceUrl,
    title:
      typeof document.metadata?.title === "string"
        ? document.metadata.title
        : null,
    markdown: document.markdown ?? "",
    provider: "firecrawl",
  };
}
