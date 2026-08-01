import { createHash } from "node:crypto";

import { DEFAULT_REALTIME_VOICE, OPENAI_MODELS } from "@/config/models";
import { getServerEnv } from "@/lib/env/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { OPENAI_API_KEY } = getServerEnv();

  if (!OPENAI_API_KEY) {
    return Response.json(
      {
        error:
          "OpenAI is not configured. Add OPENAI_API_KEY to .env.local on the server.",
      },
      { status: 503 },
    );
  }

  const clientSessionId =
    request.headers.get("x-session-id") ?? crypto.randomUUID();
  const safetyIdentifier = createHash("sha256")
    .update(clientSessionId)
    .digest("hex");

  const response = await fetch(
    "https://api.openai.com/v1/realtime/client_secrets",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Safety-Identifier": safetyIdentifier,
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: OPENAI_MODELS.realtime,
          audio: { output: { voice: DEFAULT_REALTIME_VOICE } },
        },
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    console.error("Realtime client-secret request failed", {
      status: response.status,
    });
    return Response.json(
      { error: "OpenAI could not create a Realtime session." },
      { status: 502 },
    );
  }

  const data = (await response.json()) as {
    value: string;
    expires_at?: number;
  };

  return Response.json(
    { value: data.value, expiresAt: data.expires_at },
    { headers: { "Cache-Control": "no-store" } },
  );
}
