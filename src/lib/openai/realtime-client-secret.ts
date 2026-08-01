import "server-only";

import { createHash } from "node:crypto";

import { DEFAULT_REALTIME_VOICE } from "@/config/models";
import { openAIRealtimeClientSecretSchema } from "@/lib/contracts/realtime";
import type { ServerEnv } from "@/lib/env/server";

const REALTIME_CLIENT_SECRETS_URL =
  "https://api.openai.com/v1/realtime/client_secrets";

export class RealtimeClientSecretError extends Error {
  constructor(
    message: string,
    readonly kind: "network" | "upstream" | "invalid_response",
    readonly status?: number,
  ) {
    super(message);
    this.name = "RealtimeClientSecretError";
  }
}

export function createSafetyIdentifier(sessionId: string) {
  return createHash("sha256").update(sessionId).digest("hex");
}

export async function createRealtimeClientSecret(
  env: Pick<ServerEnv, "OPENAI_API_KEY" | "OPENAI_REALTIME_MODEL">,
  sessionId: string,
  fetchImplementation: typeof fetch = fetch,
) {
  if (!env.OPENAI_API_KEY) {
    throw new RealtimeClientSecretError(
      "OpenAI is not configured.",
      "upstream",
      503,
    );
  }

  let response: Response;
  try {
    response = await fetchImplementation(REALTIME_CLIENT_SECRETS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Safety-Identifier": createSafetyIdentifier(sessionId),
      },
      body: JSON.stringify({
        expires_after: { anchor: "created_at", seconds: 600 },
        session: {
          type: "realtime",
          model: env.OPENAI_REALTIME_MODEL,
          audio: { output: { voice: DEFAULT_REALTIME_VOICE } },
        },
      }),
      cache: "no-store",
    });
  } catch {
    throw new RealtimeClientSecretError(
      "OpenAI could not be reached.",
      "network",
    );
  }

  if (!response.ok) {
    throw new RealtimeClientSecretError(
      "OpenAI rejected the client-secret request.",
      "upstream",
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new RealtimeClientSecretError(
      "OpenAI returned an unreadable client-secret response.",
      "invalid_response",
    );
  }

  const parsed = openAIRealtimeClientSecretSchema.safeParse(payload);
  if (
    !parsed.success ||
    parsed.data.session.model !== env.OPENAI_REALTIME_MODEL
  ) {
    throw new RealtimeClientSecretError(
      "OpenAI returned an invalid client-secret response.",
      "invalid_response",
    );
  }

  return parsed.data;
}
