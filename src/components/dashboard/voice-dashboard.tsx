"use client";

import { useCallback, useState } from "react";
import {
  AudioLines,
  Check,
  DatabaseZap,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { AgentStatus } from "@/components/dashboard/agent-status";
import { ConversationPanel } from "@/components/dashboard/conversation-panel";
import { VoiceControl } from "@/components/dashboard/voice-control";
import { WorkspaceCanvas } from "@/components/dashboard/workspace-canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoDashboardSnapshot } from "@/lib/data/demo";
import { useRealtimeAgent } from "@/hooks/use-realtime-agent";

export function VoiceDashboard() {
  const [snapshot, setSnapshot] = useState(demoDashboardSnapshot);
  const handleDashboardUpdate = useCallback(
    (nextSnapshot: typeof demoDashboardSnapshot) => setSnapshot(nextSnapshot),
    [],
  );
  const agent = useRealtimeAgent(handleDashboardUpdate);

  return (
    <main className="voice-grid min-h-screen bg-background p-3 text-foreground sm:p-5 lg:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1720px] flex-col sm:min-h-[calc(100vh-2.5rem)]">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl glass-panel px-5 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[#7c3aed] text-primary-foreground shadow-lg shadow-primary/25">
              <AudioLines className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-sans text-lg font-semibold tracking-tight sm:text-xl">
                YouTube Growth Agent
              </h1>
              <p className="text-xs text-muted-foreground">
                Talk through your next breakout video
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Badge
              variant="secondary"
              className="hidden h-9 rounded-full border border-border/50 bg-secondary/70 px-3.5 text-xs shadow-xs sm:flex"
            >
              <ShieldCheck className="size-3.5 text-primary" />
              You approve paid research
            </Badge>
            <AgentStatus status={agent.status} />
          </div>
        </header>

        {agent.pendingApproval && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/40 bg-accent/30 px-5 py-4 text-sm text-accent-foreground shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-card shadow-md">
                <LockKeyhole className="size-4" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold">Your approval is required</p>
                <p className="mt-0.5 text-xs opacity-90">
                  Allow one run of{" "}
                  <strong>{agent.pendingApproval.toolName}</strong>.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={agent.reject}
                className="rounded-xl border-border/60 bg-card shadow-sm hover:bg-secondary"
              >
                <X className="size-3.5" /> Reject
              </Button>
              <Button size="sm" onClick={agent.approve} className="rounded-xl shadow-md">
                <Check className="size-3.5" /> Approve once
              </Button>
            </div>
          </div>
        )}
        {agent.error && (
          <div
            className="mb-5 flex items-center gap-3 rounded-2xl bg-destructive/90 px-5 py-4 text-sm text-destructive-foreground shadow-lg backdrop-blur-sm"
            role="alert"
          >
            <X className="size-4 shrink-0" aria-hidden="true" />
            <span>{agent.error}</span>
          </div>
        )}

        <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(380px,0.72fr)_minmax(0,1.28fr)]">
          <section
            className="flex min-h-[780px] flex-col gap-4 lg:min-h-0"
            aria-label="Voice and conversation"
          >
            <div className="relative grid min-h-[420px] place-items-center overflow-hidden rounded-2xl gradient-border py-8 shadow-xl"
          >
              <div className="absolute left-6 top-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              >
                <Sparkles className="size-3 text-primary" aria-hidden="true" />
                Voice control
              </div>
              <VoiceControl
                status={agent.status}
                isConnected={agent.isConnected}
                isMuted={agent.isMuted}
                onConnect={agent.connect}
                onDisconnect={agent.disconnect}
                onInterrupt={agent.interrupt}
                onToggleMute={agent.toggleMute}
              />
            </div>
            <ConversationPanel
              messages={agent.messages}
              canSend={agent.isConnected}
              onSend={agent.sendText}
            />
          </section>
          <WorkspaceCanvas snapshot={snapshot} />
        </div>

        <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 px-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-2">
            <DatabaseZap className="size-3.5 text-primary" aria-hidden="true" />
            Research tools run only after your approval
          </span>
          <span>Voice by OpenAI gpt-realtime-2.1 · AI-generated speech</span>
        </footer>
      </div>
    </main>
  );
}
