import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { ResearchJobRepository } from "@/lib/jobs/repository";
import { createResearchJob } from "@/lib/jobs/queue";

describe("createResearchJob", () => {
  it("persists approval and a bounded default Apify input before returning queued", async () => {
    const repository = {
      enqueue: vi.fn().mockResolvedValue({
        id: "11111111-1111-4111-8111-111111111111",
      }),
      claimNext: vi.fn(),
      heartbeat: vi.fn(),
      complete: vi.fn(),
      failOrRetry: vi.fn(),
    } satisfies ResearchJobRepository;

    const result = await createResearchJob(
      {
        projectId: "22222222-2222-4222-8222-222222222222",
        query: "creator tools",
        maxCompetitors: 3,
      },
      { approved: true, approvedAt: "2026-08-01T08:00:00.000Z" },
      "33333333-3333-4333-8333-333333333333",
      repository,
    );

    expect(repository.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        approvedAt: "2026-08-01T08:00:00.000Z",
        requestedBy: "33333333-3333-4333-8333-333333333333",
        input: expect.objectContaining({
          apify: expect.objectContaining({
            searchQueries: ["creator tools"],
            maxResults: 3,
          }),
        }),
      }),
    );
    expect(result).toMatchObject({ status: "queued", provider: "supabase" });
  });
});
