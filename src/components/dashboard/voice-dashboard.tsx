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
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1680px] flex-col sm:min-h-[calc(100vh-2.5rem)]">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-[calc(var(--radius)+0.35rem)] bg-card px-4 py-3 shadow-md sm:px-5">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <AudioLines className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-semibold tracking-tight sm:text-xl">
                YouTube Growth Agent
              </h1>
              <p className="text-xs text-muted-foreground">
                Talk through your next breakout video
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge
              variant="secondary"
              className="hidden h-8 rounded-full border-0 px-3 shadow-xs sm:flex"
            >
              <ShieldCheck className="size-3" />
              You approve paid research
            </Badge>
            <AgentStatus status={agent.status} />
          </div>
        </header>

        {agent.pendingApproval && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-accent px-5 py-4 text-sm text-accent-foreground shadow-md">
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-2xl bg-card shadow-xs">
                <LockKeyhole className="size-4" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold">Your approval is required</p>
                <p className="mt-0.5 text-xs opacity-80">
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
                className="bg-card shadow-xs"
              >
                <X className="size-3.5" /> Reject
              </Button>
              <Button size="sm" onClick={agent.approve} className="shadow-sm">
                <Check className="size-3.5" /> Approve once
              </Button>
            </div>
          </div>
        )}

        {agent.error && (
          <div
            className="mb-4 flex items-center gap-3 rounded-3xl bg-destructive px-5 py-4 text-sm text-destructive-foreground shadow-md"
            role="alert"
          >
            <X className="size-4 shrink-0" aria-hidden="true" />
            <span>{agent.error}</span>
          </div>
        )}

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(350px,0.72fr)_minmax(0,1.28fr)]">
          <section
            className="flex min-h-[760px] flex-col gap-4 lg:min-h-0"
            aria-label="Voice and conversation"
          >
            <div className="relative grid min-h-[390px] place-items-center overflow-hidden rounded-[calc(var(--radius)+0.5rem)] bg-card py-7 shadow-lg">
              <div className="absolute left-5 top-5 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="size-3" aria-hidden="true" />
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

        <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-2">
            <DatabaseZap className="size-3.5" aria-hidden="true" />
            Research tools run only after your approval
          </span>
          <span>Voice by OpenAI gpt-realtime-2.1 · AI-generated speech</span>
        </footer>
      </div>
    </main>
  );
}
