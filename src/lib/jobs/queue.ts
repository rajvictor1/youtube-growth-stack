import "server-only";

import type { z } from "zod";

import { startCompetitorResearchInputSchema } from "@/lib/contracts/agent-tools";
import { getConfiguredServices, getServerEnv } from "@/lib/env/server";

type ResearchInput = z.infer<typeof startCompetitorResearchInputSchema>;

export type ResearchJob = {
  id: string;
  status: "configuration_required" | "queued";
  provider: "inline" | "trigger.dev";
  message: string;
  input: ResearchInput;
};

export async function createResearchJob(
  input: ResearchInput,
): Promise<ResearchJob> {
  const env = getServerEnv();
  const services = getConfiguredServices(env);
  const hasResearchSource =
    services.youtube || services.apify || services.firecrawl;

  if (!services.supabase || !hasResearchSource) {
    return {
      id: crypto.randomUUID(),
      status: "configuration_required",
      provider: "inline",
      message:
        "The job contract is ready, but Supabase and at least one research provider must be configured before work can be queued.",
      input,
    };
  }

  return {
    id: crypto.randomUUID(),
    status: "queued",
    provider: env.JOB_QUEUE_PROVIDER,
    message:
      env.JOB_QUEUE_PROVIDER === "trigger.dev"
        ? "Trigger.dev adapter is selected and must be connected before production use."
        : "Queued for the local development adapter.",
    input,
  };
}
