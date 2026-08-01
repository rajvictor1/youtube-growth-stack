import "server-only";

import type { z } from "zod";

import {
  researchApprovalSchema,
  startCompetitorResearchInputSchema,
} from "@/lib/contracts/agent-tools";
import { apifyYouTubeActorInputSchema } from "@/lib/contracts/apify";
import {
  SupabaseResearchJobRepository,
  type ResearchJobRepository,
} from "@/lib/jobs/repository";

type ResearchInput = z.infer<typeof startCompetitorResearchInputSchema>;
type ResearchApproval = z.infer<typeof researchApprovalSchema>;

export type ResearchJob = {
  id: string;
  status: "queued";
  provider: "supabase";
  message: string;
  input: ResearchInput;
};

export async function createResearchJob(
  input: ResearchInput,
  approval: ResearchApproval,
  requestedBy: string,
  repository: ResearchJobRepository = new SupabaseResearchJobRepository(),
): Promise<ResearchJob> {
  const parsedInput = startCompetitorResearchInputSchema.parse(input);
  const parsedApproval = researchApprovalSchema.parse(approval);
  const { id } = await repository.enqueue({
    projectId: parsedInput.projectId,
    requestedBy,
    approvedAt: parsedApproval.approvedAt,
    input: {
      query: parsedInput.query,
      maxCompetitors: parsedInput.maxCompetitors,
      apify: apifyYouTubeActorInputSchema.parse(
        parsedInput.apify ?? {
          searchQueries: [parsedInput.query],
          maxResults: parsedInput.maxCompetitors,
        },
      ),
    },
  });

  return {
    id,
    status: "queued",
    provider: "supabase",
    message: "Approved research was persisted and is waiting for a worker.",
    input: parsedInput,
  };
}
