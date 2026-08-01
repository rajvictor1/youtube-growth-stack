"use client";

import type { RunToolApprovalItem } from "@openai/agents";
import { RealtimeSession } from "@openai/agents/realtime";
import { useCallback, useEffect, useRef, useState } from "react";

import { createYouTubeGrowthAgent } from "@/agents/youtube-growth-agent";
import { OPENAI_MODELS } from "@/config/models";
import type { DashboardSnapshot } from "@/lib/contracts/dashboard";
import {
  historyToTranscript,
  type TranscriptMessage,
} from "@/lib/realtime/history";

export type VoiceAgentStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "working"
  | "speaking"
  | "error";

type PendingApproval = {
  item: RunToolApprovalItem;
  toolName: string;
};

const welcomeMessage: TranscriptMessage = {
  id: "welcome",
  role: "assistant",
  status: "completed",
  text: "Tell me what you want to learn from your competitors. I can research outliers, explain patterns, and turn them into video ideas.",
};

export function useRealtimeAgent(
  onDashboardUpdate?: (snapshot: DashboardSnapshot) => void,
) {
  const sessionRef = useRef<RealtimeSession | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState<VoiceAgentStatus>("idle");
  const [messages, setMessages] = useState<TranscriptMessage[]>([
    welcomeMessage,
  ]);
  const [error, setError] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] =
    useState<PendingApproval | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const disconnect = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    setPendingApproval(null);
    setIsMuted(false);
    setStatus("idle");
  }, []);

  useEffect(() => disconnect, [disconnect]);

  const connect = useCallback(async () => {
    if (sessionRef.current) {
      return;
    }

    setStatus("connecting");
    setError(null);

    try {
      sessionIdRef.current ??= crypto.randomUUID();
      const tokenResponse = await fetch("/api/realtime/client-secret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": sessionIdRef.current,
        },
      });
      const token = (await tokenResponse.json()) as {
        value?: string;
        error?: string;
      };

      if (!tokenResponse.ok || !token.value) {
        throw new Error(
          token.error ??
            "OpenAI is not configured. Add OPENAI_API_KEY to .env.local.",
        );
      }

      const agent = createYouTubeGrowthAgent((event) => {
        if (event.action !== "get_dashboard_snapshot") {
          return;
        }

        const result = event.result as { snapshot?: DashboardSnapshot };
        if (result.snapshot) {
          onDashboardUpdate?.(result.snapshot);
        }
      });

      const session = new RealtimeSession(agent, {
        model: OPENAI_MODELS.realtime,
        historyStoreAudio: false,
        workflowName: "youtube-growth-voice-workspace",
      });

      session.on("history_updated", (history) => {
        const transcript = historyToTranscript(history);
        setMessages(
          transcript.length > 0
            ? [welcomeMessage, ...transcript]
            : [welcomeMessage],
        );
      });
      session.on("agent_start", () => setStatus("thinking"));
      session.on("agent_tool_start", () => setStatus("working"));
      session.on("agent_tool_end", () => setStatus("thinking"));
      session.on("audio_start", () => setStatus("speaking"));
      session.on("audio_stopped", () => setStatus("listening"));
      session.on("audio_interrupted", () => setStatus("listening"));
      session.on("tool_approval_requested", (_context, _agent, request) => {
        setPendingApproval({
          item: request.approvalItem,
          toolName:
            request.type === "function_approval"
              ? request.tool.name
              : "external tool",
        });
        setStatus("working");
      });
      session.on("error", () => {
        setError("The voice session encountered an error. Please reconnect.");
        setStatus("error");
      });

      await session.connect({
        apiKey: token.value,
        model: OPENAI_MODELS.realtime,
      });

      sessionRef.current = session;
      setStatus("listening");
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Could not start the voice session.";
      setError(message);
      setStatus("error");
    }
  }, [onDashboardUpdate]);

  const sendText = useCallback((text: string) => {
    if (!sessionRef.current) {
      setError("Start the voice agent before sending a message.");
      return false;
    }

    sessionRef.current.sendMessage(text);
    setStatus("thinking");
    return true;
  }, []);

  const toggleMute = useCallback(() => {
    const session = sessionRef.current;
    if (!session) {
      return;
    }

    const nextMuted = !isMuted;
    session.mute(nextMuted);
    setIsMuted(nextMuted);
    setStatus(nextMuted ? "idle" : "listening");
  }, [isMuted]);

  const interrupt = useCallback(() => {
    sessionRef.current?.interrupt();
    setStatus("listening");
  }, []);

  const approve = useCallback(async () => {
    const session = sessionRef.current;
    if (!session || !pendingApproval) {
      return;
    }

    await session.approve(pendingApproval.item);
    setPendingApproval(null);
    setStatus("working");
  }, [pendingApproval]);

  const reject = useCallback(async () => {
    const session = sessionRef.current;
    if (!session || !pendingApproval) {
      return;
    }

    await session.reject(pendingApproval.item, {
      message: "The user did not approve this action.",
    });
    setPendingApproval(null);
    setStatus("listening");
  }, [pendingApproval]);

  return {
    approve,
    connect,
    disconnect,
    error,
    interrupt,
    isConnected: Boolean(sessionRef.current),
    isMuted,
    messages,
    pendingApproval,
    reject,
    sendText,
    status,
    toggleMute,
  };
}
