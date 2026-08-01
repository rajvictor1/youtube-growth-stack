export type NormalizedVideo = {
  externalId: string;
  title: string;
  channelExternalId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string | null;
  sourceUrl: string;
};

export type { ExternalResearchDocument } from "@/lib/contracts/external-research";
