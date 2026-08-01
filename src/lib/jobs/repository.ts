import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  claimedResearchJobSchema,
  jobExecutionErrorSchema,
  researchJobPayloadSchema,
  researchJobResultSchema,
  type ClaimedResearchJob,
  type JobExecutionError,
  type ResearchJobPayload,
  type ResearchJobResult,
} from "@/lib/jobs/contracts";

const ingestionRunRowSchema = z.object({
  id: z.uuid(),
  project_id: z.uuid(),
  requested_by: z.uuid(),
  provider: z.literal("apify"),
  input: researchJobPayloadSchema,
  attempt_count: z.number().int().nonnegative(),
  max_attempts: z.number().int().positive(),
  lease_owner: z.string().nullable(),
  lease_expires_at: z.string().nullable(),
  provider_run_id: z.string().nullable(),
  provider_dataset_id: z.string().nullable(),
});

export type EnqueueResearchJob = {
  projectId: string;
  requestedBy: string;
  approvedAt: string;
  input: ResearchJobPayload;
};

export type JobDisposition = "completed" | "retried" | "failed";

export interface ResearchJobRepository {
  enqueue(request: EnqueueResearchJob): Promise<{ id: string }>;
  claimNext(
    workerId: string,
    leaseSeconds?: number,
  ): Promise<ClaimedResearchJob | null>;
  heartbeat(job: ClaimedResearchJob, leaseSeconds?: number): Promise<void>;
  complete(job: ClaimedResearchJob, result: ResearchJobResult): Promise<void>;
  failOrRetry(
    job: ClaimedResearchJob,
    error: JobExecutionError,
    nextAvailableAt: string,
  ): Promise<JobDisposition>;
}

function requireSingleUpdatedRow<T>(
  data: T[] | null,
  error: { message: string } | null,
): T {
  if (error) throw new Error(error.message);
  if (!data || data.length !== 1) {
    throw new Error(
      "The job lease was lost before the state transition completed.",
    );
  }
  return data[0];
}

export class SupabaseResearchJobRepository implements ResearchJobRepository {
  constructor(
    private readonly client: SupabaseClient = createSupabaseAdminClient(),
  ) {}

  async enqueue(request: EnqueueResearchJob): Promise<{ id: string }> {
    const input = researchJobPayloadSchema.parse(request.input);
    const ownership = await this.client
      .from("projects")
      .select("id")
      .eq("id", request.projectId)
      .eq("owner_id", request.requestedBy)
      .maybeSingle();
    if (ownership.error) throw new Error(ownership.error.message);
    if (!ownership.data) {
      throw new Error("The authenticated user does not own this project.");
    }
    const { data, error } = await this.client
      .from("ingestion_runs")
      .insert({
        project_id: request.projectId,
        requested_by: request.requestedBy,
        approved_by: request.requestedBy,
        approved_at: request.approvedAt,
        provider: "apify",
        job_type: "apify_youtube_enrichment",
        status: "queued",
        input,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return z.object({ id: z.uuid() }).parse(data);
  }

  async claimNext(
    workerId: string,
    leaseSeconds = 3600,
  ): Promise<ClaimedResearchJob | null> {
    const { data, error } = await this.client.rpc("claim_ingestion_run", {
      worker_id: workerId,
      lease_seconds: leaseSeconds,
    });
    if (error) throw new Error(error.message);
    if (!Array.isArray(data) || data.length === 0) return null;

    const row = ingestionRunRowSchema.parse(data[0]);
    return claimedResearchJobSchema.parse({
      id: row.id,
      projectId: row.project_id,
      requestedBy: row.requested_by,
      provider: row.provider,
      input: row.input,
      attemptCount: row.attempt_count,
      maxAttempts: row.max_attempts,
      leaseOwner: row.lease_owner,
      leaseExpiresAt: row.lease_expires_at,
      resumeFrom:
        row.provider_run_id && row.provider_dataset_id
          ? { runId: row.provider_run_id, datasetId: row.provider_dataset_id }
          : undefined,
    });
  }

  async complete(
    job: ClaimedResearchJob,
    result: ResearchJobResult,
  ): Promise<void> {
    const parsed = researchJobResultSchema.parse(result);
    const response = await this.client
      .from("ingestion_runs")
      .update({
        status: "completed",
        result: parsed,
        provider_run_id: parsed.runId,
        provider_dataset_id: parsed.datasetId,
        provider_status: parsed.status,
        completed_at: new Date().toISOString(),
        lease_owner: null,
        lease_expires_at: null,
      })
      .eq("id", job.id)
      .eq("status", "running")
      .eq("lease_owner", job.leaseOwner)
      .select("id");
    requireSingleUpdatedRow(response.data, response.error);
  }

  async heartbeat(job: ClaimedResearchJob, leaseSeconds = 3600): Promise<void> {
    if (leaseSeconds < 30 || leaseSeconds > 3600) {
      throw new Error("leaseSeconds must be between 30 and 3600.");
    }
    const now = Date.now();
    const response = await this.client
      .from("ingestion_runs")
      .update({
        last_heartbeat_at: new Date(now).toISOString(),
        lease_expires_at: new Date(now + leaseSeconds * 1_000).toISOString(),
      })
      .eq("id", job.id)
      .eq("status", "running")
      .eq("lease_owner", job.leaseOwner)
      .select("id");
    requireSingleUpdatedRow(response.data, response.error);
  }

  async failOrRetry(
    job: ClaimedResearchJob,
    error: JobExecutionError,
    nextAvailableAt: string,
  ): Promise<JobDisposition> {
    const parsed = jobExecutionErrorSchema.parse(error);
    const shouldRetry = parsed.retryable && job.attemptCount < job.maxAttempts;
    const response = await this.client
      .from("ingestion_runs")
      .update({
        status: shouldRetry ? "queued" : "failed",
        available_at: nextAvailableAt,
        error_code: parsed.code,
        error_message: parsed.message,
        error_retryable: shouldRetry,
        provider_run_id: parsed.runId ?? job.resumeFrom?.runId ?? null,
        provider_dataset_id:
          parsed.datasetId ?? job.resumeFrom?.datasetId ?? null,
        provider_status: parsed.actorStatus ?? null,
        completed_at: shouldRetry ? null : new Date().toISOString(),
        lease_owner: null,
        lease_expires_at: null,
      })
      .eq("id", job.id)
      .eq("status", "running")
      .eq("lease_owner", job.leaseOwner)
      .select("id");
    requireSingleUpdatedRow(response.data, response.error);
    return shouldRetry ? "retried" : "failed";
  }
}
