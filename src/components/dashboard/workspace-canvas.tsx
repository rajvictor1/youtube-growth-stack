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
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[calc(var(--radius)+0.5rem)] bg-card shadow-lg"
      aria-label="Live workspace"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-serif text-xl font-semibold tracking-tight">
              Research desk
            </p>
            <Badge
              variant="secondary"
              className="rounded-full border-0 text-[10px] shadow-xs"
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
          className="bg-card shadow-xs"
        >
          Brief preview
          <ArrowUpRight className="size-3.5" />
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-7 px-5 pb-6 pt-2 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                What is moving
              </p>
              <h2 className="mt-1 text-sm font-semibold">Growth signals</h2>
            </div>
            <Radar className="size-4 text-primary" aria-hidden="true" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {snapshot.signals.map((signal, index) => {
              const icons = [TrendingUp, Sparkles, Radar];
              const Icon = icons[index] ?? Radar;
              return (
                <Card
                  key={signal.label}
                  className="gap-3 border-0 bg-secondary/70 py-4 shadow-sm"
                >
                  <CardContent className="px-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="grid size-8 place-items-center rounded-xl bg-card text-primary shadow-xs">
                        <Icon className="size-4" />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
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

          <Card className="gap-0 overflow-hidden border-0 bg-secondary/55 py-0 shadow-md">
            <CardHeader className="flex-row items-center justify-between py-5">
              <div>
                <CardTitle className="text-sm">Competitor outliers</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Videos performing above each channel&apos;s baseline.
                </p>
              </div>
              <div className="grid size-9 place-items-center rounded-2xl bg-card text-primary shadow-xs">
                <TrendingUp className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {snapshot.outliers.map((video, index) => (
                <div key={video.id}>
                  {index > 0 && <Separator className="bg-border/70" />}
                  <div className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {video.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {video.channel}
                      </p>
                    </div>
                    <div className="text-right sm:min-w-20">
                      <p className="text-sm font-semibold">
                        {compactNumber.format(video.views)}
                      </p>
                      <p className="text-[10px] uppercase text-muted-foreground">
                        views
                      </p>
                    </div>
                    <Badge className="col-span-2 justify-self-start rounded-full shadow-xs sm:col-span-1 sm:justify-self-auto">
                      {video.multiplier.toFixed(1)}× outlier
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-4" />
                  <h2 className="text-sm font-semibold">Ideas worth testing</h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Generated from the evidence above, not generic prompts.
                </p>
              </div>
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              {snapshot.ideas.map((idea) => (
                <Card
                  key={idea.id}
                  className="gap-4 border-0 bg-accent/70 shadow-md"
                >
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className="rounded-full bg-card shadow-xs"
                      >
                        Score {idea.score}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled
                        aria-label="Save idea preview"
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
