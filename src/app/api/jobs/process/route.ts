import { timingSafeEqual } from "node:crypto";

import { getServerEnv } from "@/lib/env/server";
import { processNextResearchJob } from "@/lib/jobs/worker";

export const runtime = "nodejs";

function secretsMatch(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  return (
    providedBytes.length === expectedBytes.length &&
    timingSafeEqual(providedBytes, expectedBytes)
  );
}

export async function POST(request: Request) {
  const { JOB_WORKER_SECRET } = getServerEnv();
  if (
    !JOB_WORKER_SECRET ||
    !secretsMatch(request.headers.get("x-job-worker-secret"), JOB_WORKER_SECRET)
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workerId = `http-worker:${crypto.randomUUID()}`;
  const result = await processNextResearchJob(workerId);
  return Response.json(result);
}
