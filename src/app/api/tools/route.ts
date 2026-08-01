import { agentToolRequestSchema } from "@/lib/contracts/agent-tools";
import { demoDashboardSnapshot } from "@/lib/data/demo";
import { getConfiguredServices } from "@/lib/env/server";
import { createResearchJob } from "@/lib/jobs/queue";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = agentToolRequestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid tool request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  switch (parsed.data.action) {
    case "get_dashboard_snapshot":
      return Response.json({
        mode: "demo",
        snapshot: demoDashboardSnapshot,
        configuredServices: getConfiguredServices(),
      });

    case "start_competitor_research": {
      const job = await createResearchJob(parsed.data.payload);
      return Response.json(job, { status: 202 });
    }

    case "save_content_idea":
      return Response.json({
        saved: false,
        reason:
          "Supabase persistence is scaffolded but requires project credentials and authentication.",
        idea: parsed.data.payload,
      });
  }
}
