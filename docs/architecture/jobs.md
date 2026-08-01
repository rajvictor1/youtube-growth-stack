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

`src/lib/jobs/queue.ts` is deliberately provider-neutral. Trigger.dev is the recommended production adapter, but no adapter should be enabled until its dependency tree and retry behavior are verified.
