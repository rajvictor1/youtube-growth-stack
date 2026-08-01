# Architecture overview

## Runtime layers

1. **Experience:** Next.js App Router, React, shadcn/ui, and tweakcn-compatible semantic tokens.
2. **Conversation:** OpenAI Agents SDK with `gpt-realtime-2.1` over browser WebRTC.
3. **Application tools:** typed, approval-aware functions exposed to the agent.
4. **Jobs:** a provider-neutral queue contract for long-running research.
5. **Sources:** YouTube Data API, Apify enrichment, and Firecrawl external research.
6. **Persistence:** Supabase Auth and Postgres with row-level security.

## Trust boundaries

- The browser receives only a short-lived `ek_…` Realtime client secret.
- Standard API keys and provider tokens remain in server route handlers and workers.
- Browser tools call application routes, never provider SDKs directly.
- Route handlers validate request bodies before invoking business logic.
- Paid and mutating agent tools pause for explicit approval.

## Current implementation boundary

The repository includes a working UI shell, Realtime session lifecycle, typed tool contracts, provider adapters, database migration, and demo workspace. Live research and persistence require credentials, Supabase setup, authentication, and a durable queue adapter.
