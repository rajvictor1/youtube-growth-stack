import {
  ArrowUpRight,
  Bookmark,
  Lightbulb,
  Radar,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { DashboardSnapshot } from "@/lib/contracts/dashboard";

const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function WorkspaceCanvas({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <section
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl glass-panel"
      aria-label="Live workspace"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-sans text-xl font-semibold tracking-tight">
              Research desk
            </p>
            <Badge
              variant="outline"
              className="rounded-full border-border/50 bg-card/60 text-[10px] shadow-xs"
            >
              Demo evidence
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Sources, patterns, and ideas appear here while you talk.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled
          className="rounded-xl border-border/50 bg-card/60 shadow-xs"
        >
          Brief preview
          <ArrowUpRight className="size-3.5" />
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-8 px-5 pb-6 pt-2 sm:px-6">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                What is moving
              </p>
              <h2 className="mt-1 text-sm font-semibold">Growth signals</h2>
            </div>
            <div className="grid size-9 place-items-center rounded-2xl bg-secondary/70 text-primary shadow-sm">
              <Radar className="size-4" aria-hidden="true" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {snapshot.signals.map((signal, index) => {
              const icons = [TrendingUp, Sparkles, Radar];
              const Icon = icons[index] ?? Radar;
              return (
                <Card
                  key={signal.label}
                  className="group relative gap-3 overflow-hidden border-0 bg-gradient-to-b from-card to-secondary/80 py-4 shadow-md transition-all hover:shadow-lg"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-[#8b5cf6] to-primary/40 opacity-0 transition-opacity group-hover:opacity-100" />
                  <CardContent className="px-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="grid size-9 place-items-center rounded-xl bg-secondary text-primary shadow-sm">
                        <Icon className="size-4" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Signal
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {signal.label}
                    </p>
                    <p className="mt-1 font-semibold">{signal.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {signal.detail}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Outliers */}
          <Card className="relative gap-0 overflow-hidden border-0 bg-gradient-to-b from-card to-secondary/80 py-0 shadow-lg">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-[#8b5cf6] to-primary/30" />
            <CardHeader className="flex-row items-center justify-between py-5">
              <div>
                <CardTitle className="text-sm">Competitor outliers</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Videos performing above each channel&apos;s baseline.
                </p>
              </div>
              <div className="grid size-9 place-items-center rounded-2xl bg-secondary/70 text-primary shadow-sm">
                <TrendingUp className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {snapshot.outliers.map((video, index) => (
                <div key={video.id}>
                  {index > 0 && <Separator className="bg-border/60" />}
                  <div className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4 transition-colors hover:bg-secondary/40 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {video.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {video.channel}
                      </p>
                    </div>
                    <div className="text-right sm:min-w-24">
                      <p className="text-sm font-semibold">
                        {compactNumber.format(video.views)}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        views
                      </p>
                    </div>
                    <Badge className="col-span-2 justify-self-start rounded-full border-0 bg-gradient-to-r from-primary to-[#7c3aed] text-primary-foreground shadow-sm sm:col-span-1 sm:justify-self-auto">
                      {video.multiplier.toFixed(1)}× outlier
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Ideas */}
          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-4 text-primary" />
                  <h2 className="text-sm font-semibold">Ideas worth testing</h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Generated from the evidence above, not generic prompts.
                </p>
              </div>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {snapshot.ideas.map((idea) => (
                <Card
                  key={idea.id}
                  className="group relative gap-4 overflow-hidden border-0 bg-gradient-to-br from-accent/60 to-accent/30 shadow-md transition-all hover:shadow-lg"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#d97706] opacity-80" />
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="rounded-full border-border/50 bg-card/60 px-2.5 text-xs shadow-xs"
                      >
                        Score {idea.score}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled
                        aria-label="Save idea preview"
                        className="rounded-full hover:bg-card/50"
                      >
                        <Bookmark className="size-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-base leading-6">
                      {idea.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {idea.angle}
                    </p>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Evidence: {idea.evidence.length} source videos
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </section>
  );
}
