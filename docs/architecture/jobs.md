# Durable research jobs

Interactive route handlers must not wait for full competitor research.

The agent tool should:

1. Validate the request.
2. Ask for approval when the run may spend provider credits.
3. Create an `ingestion_runs` row.
4. Enqueue a durable job.
5. Return a truthful `queued` response.
6. Let the worker collect, normalize, deduplicate, analyze, and persist evidence.
7. Notify the conversation when the run completes.

## Supabase worker protocol

`src/lib/jobs/queue.ts` creates an approved `ingestion_runs` row through the
service-role repository. The caller must be an authenticated project owner and
the application route records the approval time before the row is claimable.
Authenticated clients can read their runs through RLS, but only trusted server
code can mutate worker-owned state.

A scheduler invokes `POST /api/jobs/process` with `x-job-worker-secret`. Each
request atomically claims at most one due row using `for update skip locked`,
increments the attempt counter, and grants a bounded lease. This makes multiple
workers safe and lets another worker reclaim an abandoned attempt after expiry.
Active workers extend that lease with a server-side heartbeat while the Actor
or dataset request is still running.

The worker executes the Apify YouTube adapter and records one of these truthful
transitions:

- `queued -> running -> completed`
- `queued -> running -> queued` for a retryable failure before `max_attempts`
- `queued -> running -> failed` for terminal errors or exhausted attempts
- expired `running` leases are reclaimed, or failed when no attempt remains

Apify run and dataset IDs are persisted on both success and failure. When a run
succeeded but dataset retrieval failed, the next attempt passes those IDs as
`resumeFrom`; it reads the existing dataset instead of starting a second paid
Actor run.

The HTTP worker endpoint is a safe scheduler hook, not a long-lived daemon. A
production scheduler should call it repeatedly, keep `JOB_WORKER_SECRET`
server-only, and use a request timeout longer than the configured Actor run.
