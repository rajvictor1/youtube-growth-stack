import { OPENAI_MODELS } from "@/config/models";
import { realtimeClientSecretRequestSchema } from "@/lib/contracts/realtime";
import { getServerEnv } from "@/lib/env/server";
import {
  createRealtimeClientSecret,
  RealtimeClientSecretError,
} from "@/lib/openai/realtime-client-secret";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const env = getServerEnv();

  if (!env.OPENAI_API_KEY) {
    return Response.json(
      {
        error:
          "OpenAI is not configured. Add OPENAI_API_KEY to .env.local on the server.",
      },
      { status: 503 },
    );
  }

  const parsedRequest = realtimeClientSecretRequestSchema.safeParse({
    sessionId: request.headers.get("x-session-id"),
  });
  if (!parsedRequest.success) {
    return Response.json(
      { error: "A valid voice session identifier is required." },
      { status: 400 },
    );
  }

  try {
    const data = await createRealtimeClientSecret(
      env,
      parsedRequest.data.sessionId,
    );

    return Response.json(
      {
        value: data.value,
        expiresAt: data.expires_at,
        model: OPENAI_MODELS.realtime,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Realtime client-secret request failed", {
      kind:
        error instanceof RealtimeClientSecretError ? error.kind : "unexpected",
      status:
        error instanceof RealtimeClientSecretError ? error.status : undefined,
    });
    return Response.json(
      { error: "OpenAI could not create a Realtime session." },
      { status: 502 },
    );
  }
}
