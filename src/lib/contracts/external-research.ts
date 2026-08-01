import { z } from "zod";

const MAX_RESEARCH_MARKDOWN_LENGTH = 25_000;

function isPublicWebUrl(value: string) {
  const { hostname, protocol } = new URL(value);
  const normalizedHostname = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const isPrivateIpv4 =
    /^10\./.test(normalizedHostname) ||
    /^127\./.test(normalizedHostname) ||
    /^169\.254\./.test(normalizedHostname) ||
    /^192\.168\./.test(normalizedHostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(normalizedHostname);

  return (
    ["http:", "https:"].includes(protocol) &&
    normalizedHostname !== "localhost" &&
    !normalizedHostname.endsWith(".localhost") &&
    normalizedHostname !== "::1" &&
    !isPrivateIpv4
  );
}

export const externalResearchSourceInputSchema = z.object({
  sourceUrl: z.url().max(2048).refine(isPublicWebUrl, {
    message: "Source URL must be a public HTTP or HTTPS URL.",
  }),
});

export const externalResearchDocumentSchema = z.object({
  provider: z.literal("firecrawl"),
  purpose: z.literal("supporting_web_research"),
  sourceUrl: z.url(),
  resolvedUrl: z.url(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  markdown: z.string().min(1).max(MAX_RESEARCH_MARKDOWN_LENGTH),
  truncated: z.boolean(),
  publishedAt: z.string().nullable(),
});

export type ExternalResearchSourceInput = z.infer<
  typeof externalResearchSourceInputSchema
>;
export type ExternalResearchDocument = z.infer<
  typeof externalResearchDocumentSchema
>;

export { MAX_RESEARCH_MARKDOWN_LENGTH };
