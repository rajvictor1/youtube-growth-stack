import { OPENAI_MODELS } from "@/config/models";
import { getConfiguredServices } from "@/lib/env/server";

export const runtime = "nodejs";

export function GET() {
  return Response.json({
    status: "ok",
    models: OPENAI_MODELS,
    services: getConfiguredServices(),
  });
}
