import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20260801010000_durable_ingestion_jobs.sql",
  ),
  "utf8",
);

describe("durable ingestion jobs migration", () => {
  it("restricts job claiming to the service role", () => {
    expect(migration).toContain(
      "revoke all on function public.claim_ingestion_run",
    );
    expect(migration).toContain(
      "grant execute on function public.claim_ingestion_run(text, integer) to service_role",
    );
  });

  it("claims approved work atomically and skips locked rows", () => {
    expect(migration).toContain("approved_at is not null");
    expect(migration).toContain("for update skip locked");
    expect(migration).toContain("attempt_count = attempt_count + 1");
  });

  it("removes authenticated write access to worker-managed state", () => {
    expect(migration).toContain('drop policy "ingestion_runs_owner_all"');
    expect(migration).toContain('create policy "ingestion_runs_owner_select"');
  });
});
