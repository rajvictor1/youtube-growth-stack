import { agentToolRequestSchema } from "@/lib/contracts/agent-tools";
import { demoDashboardSnapshot } from "@/lib/data/demo";
import { getConfiguredServices } from "@/lib/env/server";
import { createResearchJob } from "@/lib/jobs/queue";
import { scrapeExternalResearchSource } from "@/lib/providers/firecrawl";
import { getAuthenticatedUserId } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = agentToolRequestSchema.safeParse(body);

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
      const requestedBy = await getAuthenticatedUserId(request);
      if (!requestedBy) {
        return Response.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }
      const { approval, ...input } = parsed.data.payload;
      const job = await createResearchJob(input, approval, requestedBy);
      return Response.json(job, { status: 202 });
    }

    case "research_external_source": {
      const document = await scrapeExternalResearchSource(
        parsed.data.payload.sourceUrl,
      );
      return Response.json({ status: "completed", document });
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
