import { z } from "zod";

import { apifyYouTubeActorInputSchema } from "@/lib/contracts/apify";
import { dashboardSnapshotSchema } from "@/lib/contracts/dashboard";
import {
  externalResearchDocumentSchema,
  externalResearchSourceInputSchema,
} from "@/lib/contracts/external-research";

export const getDashboardSnapshotInputSchema = z.object({});

export const startCompetitorResearchInputSchema = z.object({
  projectId: z.uuid(),
  query: z.string().min(2).max(500),
  maxCompetitors: z.number().int().min(1).max(20).default(8),
  apify: apifyYouTubeActorInputSchema.optional(),
});

export const researchApprovalSchema = z.object({
  approved: z.literal(true),
  approvedAt: z.iso.datetime(),
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
    payload: startCompetitorResearchInputSchema.extend({
      approval: researchApprovalSchema,
    }),
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

const configuredServicesSchema = z.object({
  openai: z.boolean(),
  supabase: z.boolean(),
  youtube: z.boolean(),
  apify: z.boolean(),
  firecrawl: z.boolean(),
});

export const getDashboardSnapshotResultSchema = z.object({
  mode: z.literal("demo"),
  snapshot: dashboardSnapshotSchema,
  configuredServices: configuredServicesSchema,
});

export const startCompetitorResearchResultSchema = z.object({
  id: z.uuid(),
  status: z.literal("queued"),
  provider: z.literal("supabase"),
  message: z.string(),
  input: startCompetitorResearchInputSchema,
});

export const researchExternalSourceResultSchema = z.object({
  status: z.literal("completed"),
  document: externalResearchDocumentSchema,
});

export const saveContentIdeaResultSchema = z.object({
  saved: z.literal(false),
  reason: z.string(),
  idea: saveContentIdeaInputSchema,
});

export const agentToolResultSchemas = {
  get_dashboard_snapshot: getDashboardSnapshotResultSchema,
  start_competitor_research: startCompetitorResearchResultSchema,
  research_external_source: researchExternalSourceResultSchema,
  save_content_idea: saveContentIdeaResultSchema,
} satisfies Record<AgentToolRequest["action"], z.ZodType>;

export type AgentToolResultMap = {
  get_dashboard_snapshot: z.infer<typeof getDashboardSnapshotResultSchema>;
  start_competitor_research: z.infer<
    typeof startCompetitorResearchResultSchema
  >;
  research_external_source: z.infer<typeof researchExternalSourceResultSchema>;
  save_content_idea: z.infer<typeof saveContentIdeaResultSchema>;
};
