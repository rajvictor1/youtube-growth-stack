<!-- BEGIN:nextjs-agent-rules -->
# Next.js version rule

This repository uses a current Next.js release whose APIs may differ from older training data. Read the relevant guide in `node_modules/next/dist/docs/` before changing framework behavior. Follow deprecation notices.
<!-- END:nextjs-agent-rules -->

# YouTube Growth Stack agent guide

## Product outcome

Build a voice-first research agent that helps YouTube creators find competitor outliers, understand evidence-backed patterns, and turn those patterns into useful video ideas. Voice is the primary control surface; the visual workspace is the verification surface.

## Read before changing code

1. Read `docs/product/vision.md` and the relevant feature specification.
2. Read `docs/architecture/overview.md` and the nearest nested `AGENTS.md`.
3. Inspect existing contracts, tests, and provider boundaries before editing.
4. For OpenAI behavior, verify current official docs rather than guessing model or event shapes.

## Architecture map

- `src/app`: Next.js pages and server-only route handlers.
- `src/components`: product UI and shadcn/ui primitives.
- `src/agents`: Realtime agent instructions and tool definitions.
- `src/hooks`: browser Realtime session lifecycle.
- `src/lib/contracts`: Zod schemas shared across boundaries.
- `src/lib/providers`: server-only YouTube, Apify, and Firecrawl adapters.
- `src/lib/supabase`: browser and trusted server clients.
- `src/lib/jobs`: provider-neutral durable job contract.
- `supabase/migrations`: reviewed, append-only database changes.
- `docs`: durable product and architecture context.
- `tasks`: PR-sized specifications and loop state.
- `.agents/skills`: reusable repository workflows.

## Security invariants

- Never expose `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, provider tokens, or actor credentials to browser bundles.
- Never name a secret with a `NEXT_PUBLIC_` prefix.
- Browser voice sessions must use short-lived Realtime client secrets minted by the server.
- Do not persist raw microphone audio by default.
- Validate every route and tool boundary with Zod.
- Require human approval for paid research, writes, publishing, deletion, and destructive migrations.
- Keep tool results truthful. Never claim a job succeeded from an accepted/queued response.

## Implementation conventions

- Use TypeScript with strict types; avoid `any` at application boundaries.
- Keep provider SDKs inside server-only modules.
- Keep UI components dependent on semantic theme tokens so tweakcn themes remain drop-in.
- Keep spoken responses short; display tables, sources, and detailed evidence in the workspace.
- Treat demo data as demo data in both code and UI.
- Add a migration instead of editing an applied migration.
- Keep one feature story small enough for one agent context window.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run verify
npm run security:audit
```

Run `npm run verify` before asking for review. Run `git diff --check` and a publication-scoped secret scan before pushing.

## Loop-engineering rules

- Work on a feature branch, never directly on `main`.
- Select one failing story from `tasks/<feature>/stories.json`.
- Implement only that story and its acceptance criteria.
- Run targeted checks, then `npm run verify`.
- Update the story state and append concrete learnings to `progress.md`.
- Stop on missing authority, destructive operations, or external side effects.
- The loop may prepare commits and pull requests; it must never merge automatically.

## Code review rules

- Flag any browser access to server-only secrets as critical.
- Flag tools that perform paid or write actions without approval.
- Flag ungrounded metrics, generated citations, or success claims.
- Flag missing RLS policies for new user-owned tables.
- Flag UI changes that remove keyboard/text fallbacks or accessible labels.
- Flag long-running provider calls executed directly inside interactive request paths.
