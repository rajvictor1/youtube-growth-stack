import "server-only";

import Firecrawl, { type Document } from "@mendable/firecrawl-js";
import { z } from "zod";

import {
  externalResearchDocumentSchema,
  externalResearchSourceInputSchema,
  MAX_RESEARCH_MARKDOWN_LENGTH,
  type ExternalResearchDocument,
} from "@/lib/contracts/external-research";
import { getServerEnv } from "@/lib/env/server";

const firecrawlDocumentSchema = z.object({
  markdown: z.string().min(1),
  metadata: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      sourceURL: z.url().optional(),
      publishedTime: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

type FirecrawlScrapeClient = {
  scrape(
    sourceUrl: string,
    options: {
      formats: ["markdown"];
      onlyMainContent: true;
      timeout: number;
    },
  ): Promise<Document>;
};

function createFirecrawlClient(): FirecrawlScrapeClient {
  const { FIRECRAWL_API_KEY } = getServerEnv();
  if (!FIRECRAWL_API_KEY) {
    throw new Error("FIRECRAWL_API_KEY is not configured.");
  }

  return new Firecrawl({ apiKey: FIRECRAWL_API_KEY });
}

export async function scrapeExternalResearchSource(
  sourceUrl: string,
  client: FirecrawlScrapeClient = createFirecrawlClient(),
): Promise<ExternalResearchDocument> {
  const input = externalResearchSourceInputSchema.parse({ sourceUrl });
  const document = await client.scrape(input.sourceUrl, {
    formats: ["markdown"],
    onlyMainContent: true,
    timeout: 20_000,
  });
  const parsedDocument = firecrawlDocumentSchema.parse(document);
  const truncated =
    parsedDocument.markdown.length > MAX_RESEARCH_MARKDOWN_LENGTH;

  return externalResearchDocumentSchema.parse({
    provider: "firecrawl",
    purpose: "supporting_web_research",
    sourceUrl: input.sourceUrl,
    resolvedUrl: parsedDocument.metadata?.sourceURL ?? input.sourceUrl,
    title: parsedDocument.metadata?.title ?? null,
    description: parsedDocument.metadata?.description ?? null,
    markdown: parsedDocument.markdown.slice(0, MAX_RESEARCH_MARKDOWN_LENGTH),
    truncated,
    publishedAt: parsedDocument.metadata?.publishedTime ?? null,
  });
}
