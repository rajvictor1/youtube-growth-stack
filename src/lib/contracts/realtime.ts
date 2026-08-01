import { z } from "zod";

import { OPENAI_MODELS } from "@/config/models";

export const realtimeClientSecretRequestSchema = z.object({
  sessionId: z.uuid(),
});

export const openAIRealtimeClientSecretSchema = z.object({
  value: z.string().startsWith("ek_").min(4),
  expires_at: z.number().int().positive(),
  session: z
    .object({
      model: z.string(),
      type: z.literal("realtime"),
    })
    .passthrough(),
});

export const realtimeClientSecretResponseSchema = z.object({
  value: z.string().startsWith("ek_").min(4),
  expiresAt: z.number().int().positive(),
  model: z.literal(OPENAI_MODELS.realtime),
});

export type RealtimeClientSecretResponse = z.infer<
  typeof realtimeClientSecretResponseSchema
>;
