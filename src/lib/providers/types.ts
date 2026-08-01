export type NormalizedVideo = {
  externalId: string;
  title: string;
  channelExternalId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string | null;
  sourceUrl: string;
};

export type ExternalResearchDocument = {
  sourceUrl: string;
  title: string | null;
  markdown: string;
  provider: "firecrawl";
};
