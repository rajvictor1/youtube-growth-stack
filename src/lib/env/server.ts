import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_REALTIME_MODEL: z
    .literal("gpt-realtime-2.1")
    .default("gpt-realtime-2.1"),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  YOUTUBE_API_KEY: z.string().min(1).optional(),
  APIFY_API_TOKEN: z.string().min(1).optional(),
  APIFY_ACTOR_ID: z.string().min(1).optional(),
  FIRECRAWL_API_KEY: z.string().min(1).optional(),
  JOB_WORKER_SECRET: z.string().min(32).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}

export function getConfiguredServices(env = getServerEnv()) {
  return {
    openai: Boolean(env.OPENAI_API_KEY),
    supabase: Boolean(
      env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY,
    ),
    youtube: Boolean(env.YOUTUBE_API_KEY),
    apify: Boolean(env.APIFY_API_TOKEN && env.APIFY_ACTOR_ID),
    firecrawl: Boolean(env.FIRECRAWL_API_KEY),
  };
}
