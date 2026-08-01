import { z } from "zod";

import {
  apifyYouTubeActorInputSchema,
  apifyYouTubeDatasetItemSchema,
} from "@/lib/contracts/apify";

export const researchJobPayloadSchema = z.object({
  query: z.string().min(2).max(500),
  maxCompetitors: z.number().int().min(1).max(20),
  apify: apifyYouTubeActorInputSchema,
});

export const jobExecutionErrorSchema = z.object({
  code: z.string().min(1).max(100),
  message: z.string().min(1).max(2_000),
  retryable: z.boolean(),
  runId: z.string().min(1).optional(),
  datasetId: z.string().min(1).optional(),
  actorStatus: z.string().min(1).optional(),
});

export const researchJobResultSchema = z.object({
  runId: z.string().min(1),
  datasetId: z.string().min(1),
  status: z.literal("SUCCEEDED"),
  items: z.array(apifyYouTubeDatasetItemSchema),
});

export const claimedResearchJobSchema = z.object({
  id: z.uuid(),
  projectId: z.uuid(),
  requestedBy: z.uuid(),
  provider: z.literal("apify"),
  input: researchJobPayloadSchema,
  attemptCount: z.number().int().positive(),
  maxAttempts: z.number().int().positive(),
  leaseOwner: z.string().min(1),
  leaseExpiresAt: z.iso.datetime(),
  resumeFrom: z
    .object({ runId: z.string().min(1), datasetId: z.string().min(1) })
    .optional(),
});

export type ResearchJobPayload = z.infer<typeof researchJobPayloadSchema>;
export type JobExecutionError = z.infer<typeof jobExecutionErrorSchema>;
export type ResearchJobResult = z.infer<typeof researchJobResultSchema>;
export type ClaimedResearchJob = z.infer<typeof claimedResearchJobSchema>;
