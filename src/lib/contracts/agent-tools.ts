import { z } from "zod";

import { apifyYouTubeActorInputSchema } from "@/lib/contracts/apify";
import { externalResearchSourceInputSchema } from "@/lib/contracts/external-research";

export const getDashboardSnapshotInputSchema = z.object({});

export const startCompetitorResearchInputSchema = z.object({
  query: z.string().min(2).max(500),
  maxCompetitors: z.number().int().min(1).max(20).default(8),
  apify: apifyYouTubeActorInputSchema.optional(),
});

export const saveContentIdeaInputSchema = z.object({
  title: z.string().min(3).max(180),
  angle: z.string().min(3).max(1000),
});

export const agentToolRequestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("get_dashboard_snapshot"),
    payload: getDashboardSnapshotInputSchema,
  }),
  z.object({
    action: z.literal("start_competitor_research"),
    payload: startCompetitorResearchInputSchema,
  }),
  z.object({
    action: z.literal("research_external_source"),
    payload: externalResearchSourceInputSchema,
  }),
  z.object({
    action: z.literal("save_content_idea"),
    payload: saveContentIdeaInputSchema,
  }),
]);

export type AgentToolRequest = z.infer<typeof agentToolRequestSchema>;
