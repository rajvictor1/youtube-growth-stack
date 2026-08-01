import "server-only";

import {
  getApifyYouTubeExecutionFailure,
  runYouTubeEnrichmentActor,
} from "@/lib/providers/apify";
import {
  jobExecutionErrorSchema,
  researchJobResultSchema,
  type ClaimedResearchJob,
  type JobExecutionError,
  type ResearchJobResult,
} from "@/lib/jobs/contracts";
import {
  SupabaseResearchJobRepository,
  type JobDisposition,
  type ResearchJobRepository,
} from "@/lib/jobs/repository";

export type ApifyJobExecutor = (
  job: ClaimedResearchJob,
) => Promise<ResearchJobResult>;

export type ProcessJobResult =
  | { status: "idle" }
  | { status: "completed"; jobId: string }
  | { status: JobDisposition; jobId: string; error: JobExecutionError };

function retryAt(attemptCount: number): string {
  const delaySeconds = Math.min(300, 5 * 2 ** Math.max(0, attemptCount - 1));
  return new Date(Date.now() + delaySeconds * 1_000).toISOString();
}

export function serializeJobExecutionError(error: unknown): JobExecutionError {
  const parsed = jobExecutionErrorSchema.safeParse(error);
  if (parsed.success) return parsed.data;
  return {
    code: "UNEXPECTED_ERROR",
    message:
      error instanceof Error
        ? error.message.slice(0, 2_000)
        : "Unexpected job execution failure.",
    retryable: true,
  };
}

export const executeApifyResearchJob: ApifyJobExecutor = async (job) => {
  try {
    return researchJobResultSchema.parse(
      await runYouTubeEnrichmentActor(job.input.apify, {
        resumeFrom: job.resumeFrom,
      }),
    );
  } catch (error) {
    throw getApifyYouTubeExecutionFailure(error);
  }
};

export async function processNextResearchJob(
  workerId: string,
  repository: ResearchJobRepository = new SupabaseResearchJobRepository(),
  execute: ApifyJobExecutor = executeApifyResearchJob,
): Promise<ProcessJobResult> {
  const job = await repository.claimNext(workerId);
  if (!job) return { status: "idle" };

  const heartbeat = setInterval(() => {
    void repository.heartbeat(job).catch(() => {
      // The conditional completion/failure updates remain the authority if a
      // heartbeat races with a lost lease or a transient database failure.
    });
  }, 60_000);
  heartbeat.unref();

  try {
    const result = await execute(job);
    await repository.complete(job, result);
    return { status: "completed", jobId: job.id };
  } catch (cause) {
    const error = serializeJobExecutionError(cause);
    const disposition = await repository.failOrRetry(
      job,
      error,
      retryAt(job.attemptCount),
    );
    return { status: disposition, jobId: job.id, error };
  } finally {
    clearInterval(heartbeat);
  }
}
