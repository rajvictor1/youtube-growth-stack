"use client";

import { useCallback, useState } from "react";
import { AudioLines, Check, GitBranch, ShieldCheck, X } from "lucide-react";

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
    <main className="voice-grid min-h-screen bg-background p-3 text-foreground sm:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1600px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl shadow-foreground/5 sm:min-h-[calc(100vh-2.5rem)]">
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <AudioLines className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">
                YouTube Growth Stack
              </h1>
              <p className="text-xs text-muted-foreground">
                Voice-first competitor intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden rounded-full sm:flex">
              <ShieldCheck className="size-3" />
              Human-approved actions
            </Badge>
            <AgentStatus status={agent.status} />
            <Button variant="ghost" size="icon" aria-label="Open GitHub repository">
              <GitBranch className="size-4" />
            </Button>
          </div>
        </header>

        {agent.pendingApproval && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-amber-500/10 px-5 py-3 text-sm">
            <p>
              Approve the agent action: <strong>{agent.pendingApproval.toolName}</strong>
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={agent.reject}>
                <X className="size-3.5" /> Reject
              </Button>
              <Button size="sm" onClick={agent.approve}>
                <Check className="size-3.5" /> Approve once
              </Button>
            </div>
          </div>
        )}

        {agent.error && (
          <div className="border-b border-destructive/20 bg-destructive/10 px-5 py-3 text-sm text-destructive">
            {agent.error}
          </div>
        )}

        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
          <div className="flex min-h-[680px] flex-col border-b lg:min-h-0 lg:border-r lg:border-b-0">
            <div className="grid min-h-[300px] place-items-center border-b bg-muted/10 px-5 py-8">
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
          </div>
          <WorkspaceCanvas snapshot={snapshot} />
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t px-5 py-2.5 text-[11px] text-muted-foreground">
          <span>Powered by OpenAI gpt-realtime-2.1</span>
          <span>The spoken voice is AI-generated.</span>
        </footer>
      </div>
    </main>
  );
}
