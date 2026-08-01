import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  createRealtimeClientSecret,
  createSafetyIdentifier,
  RealtimeClientSecretError,
} from "@/lib/openai/realtime-client-secret";

const sessionId = "e4b9ab66-1882-4df1-92ae-5794f98e8d98";
const env = {
  OPENAI_API_KEY: "test-standard-key-never-returned",
  OPENAI_REALTIME_MODEL: "gpt-realtime-2.1" as const,
};

describe("createRealtimeClientSecret", () => {
  it("mints a scoped secret with the expected model and safety identifier", async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () =>
      Response.json({
        value: "ek_test_ephemeral",
        expires_at: 1_900_000_000,
        session: { type: "realtime", model: "gpt-realtime-2.1" },
      }),
    );

    const result = await createRealtimeClientSecret(
      env,
      sessionId,
      fetchImplementation,
    );

    expect(result.value).toBe("ek_test_ephemeral");
    expect(JSON.stringify(result)).not.toContain(env.OPENAI_API_KEY);
    expect(fetchImplementation).toHaveBeenCalledOnce();

    const [url, init] = fetchImplementation.mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/realtime/client_secrets");
    expect(init?.headers).toMatchObject({
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "OpenAI-Safety-Identifier": createSafetyIdentifier(sessionId),
    });
    expect(JSON.parse(String(init?.body))).toMatchObject({
      expires_after: { anchor: "created_at", seconds: 600 },
      session: { type: "realtime", model: "gpt-realtime-2.1" },
    });
  });

  it("rejects malformed upstream responses", async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () =>
      Response.json({ value: env.OPENAI_API_KEY }),
    );

    await expect(
      createRealtimeClientSecret(env, sessionId, fetchImplementation),
    ).rejects.toMatchObject({
      kind: "invalid_response",
    });
  });

  it("converts network failures into a redacted integration error", async () => {
    const fetchImplementation = vi.fn<typeof fetch>(async () => {
      throw new Error(`request failed with ${env.OPENAI_API_KEY}`);
    });

    const error = await createRealtimeClientSecret(
      env,
      sessionId,
      fetchImplementation,
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(RealtimeClientSecretError);
    expect(String(error)).not.toContain(env.OPENAI_API_KEY);
  });
});
