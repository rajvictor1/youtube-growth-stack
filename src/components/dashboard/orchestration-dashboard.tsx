import {
  ArrowRight,
  Bot,
  Braces,
  Cloud,
  GitBranch,
  Layers3,
  Mic2,
  Network,
  Radio,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const workstreams = [
  {
    name: "Apify",
    detail: "YouTube actor and structured research data",
    branch: "codex/apify-youtube-actor",
    icon: Layers3,
  },
  {
    name: "Firecrawl",
    detail: "Supporting web and competitor research",
    branch: "codex/firecrawl-cloud-integration",
    icon: Cloud,
  },
  {
    name: "OpenAI Realtime",
    detail: "Voice session and typed agent tools",
    branch: "codex/openai-realtime-integration",
    icon: Radio,
  },
] as const;

export function OrchestrationDashboard() {
  return (
    <main className="min-h-screen bg-muted/30 p-3 text-foreground sm:p-6 lg:p-8">
      <div className="mx-auto min-h-[calc(100vh-1.5rem)] max-w-6xl overflow-hidden rounded-3xl border bg-background shadow-sm sm:min-h-[calc(100vh-3rem)]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Mic2 className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-semibold tracking-tight">YouTube Growth Stack</h1>
              <p className="text-xs text-muted-foreground">Agent workspace</p>
            </div>
          </div>

          <Badge variant="secondary" className="gap-2 rounded-full px-3 py-1.5">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-30" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            3 workstreams active
          </Badge>
        </header>

        <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <section className="max-w-3xl" aria-labelledby="workspace-title">
            <Badge variant="outline" className="mb-5 rounded-full">
              <Network className="size-3.5" aria-hidden="true" />
              Orchestrated development
            </Badge>
            <h2
              id="workspace-title"
              className="text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-5xl"
            >
              One product. Three focused agents. One integration point.
            </h2>
            <p className="mt-5 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Each integration is being built in an isolated Git worktree. The
              orchestrator reviews the work, resolves shared decisions, and moves
              verified changes into the application.
            </p>
          </section>

          <section className="mt-10 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]" aria-label="Development workstreams">
            <Card className="overflow-hidden border-primary bg-primary py-0 text-primary-foreground shadow-none">
              <CardContent className="flex h-full min-h-64 flex-col justify-between p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid size-11 place-items-center rounded-2xl bg-primary-foreground/10">
                    <Bot className="size-5" aria-hidden="true" />
                  </div>
                  <Badge className="border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground">
                    Orchestrator
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight">Frontend + integration</p>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-primary-foreground/70">
                    Owns the product experience, shared package files, final verification,
                    and clean integration into main.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-primary-foreground/70">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Reviews every workstream before merge
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              {workstreams.map((workstream, index) => {
                const Icon = workstream.icon;

                return (
                  <Card key={workstream.name} className="py-0 shadow-none">
                    <CardContent className="grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
                      <div className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium">{workstream.name}</h3>
                          <span className="text-xs text-muted-foreground">
                            0{index + 1}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {workstream.detail}
                        </p>
                        <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                          <GitBranch className="size-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate font-mono">{workstream.branch}</span>
                        </p>
                      </div>
                      <Badge variant="outline" className="w-fit rounded-full">
                        Working
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="mt-10 rounded-2xl border bg-muted/30 p-5 sm:p-6" aria-labelledby="flow-title">
            <div className="flex items-center gap-2">
              <Braces className="size-4 text-muted-foreground" aria-hidden="true" />
              <h2 id="flow-title" className="text-sm font-medium">How work moves</h2>
            </div>
            <ol className="mt-5 grid gap-3 text-sm sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
              <li className="rounded-xl border bg-background p-4">
                <span className="text-xs text-muted-foreground">01</span>
                <p className="mt-2 font-medium">Build in isolation</p>
              </li>
              <ArrowRight className="hidden size-4 text-muted-foreground sm:block" aria-hidden="true" />
              <li className="rounded-xl border bg-background p-4">
                <span className="text-xs text-muted-foreground">02</span>
                <p className="mt-2 font-medium">Verify real behavior</p>
              </li>
              <ArrowRight className="hidden size-4 text-muted-foreground sm:block" aria-hidden="true" />
              <li className="rounded-xl border bg-background p-4">
                <span className="text-xs text-muted-foreground">03</span>
                <p className="mt-2 font-medium">Review and integrate</p>
              </li>
            </ol>
          </section>
        </div>
      </div>
    </main>
  );
}
