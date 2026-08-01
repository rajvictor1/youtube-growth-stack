import {
  AudioWaveform,
  LoaderCircle,
  Mic,
  MicOff,
  PhoneOff,
  Square,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VoiceAgentStatus } from "@/hooks/use-realtime-agent";

type VoiceControlProps = {
  status: VoiceAgentStatus;
  isConnected: boolean;
  isMuted: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onInterrupt: () => void;
  onToggleMute: () => void;
};

export function VoiceControl({
  status,
  isConnected,
  isMuted,
  onConnect,
  onDisconnect,
  onInterrupt,
  onToggleMute,
}: VoiceControlProps) {
  const isAnimating = ["listening", "thinking", "working", "speaking"].includes(
    status,
  );

  const stateCopy: Record<VoiceAgentStatus, { title: string; detail: string }> =
    {
      idle: {
        title: "Tap to start talking",
        detail:
          "Ask for competitor research, patterns, or your next video idea.",
      },
      connecting: {
        title: "Opening a private session",
        detail: "Creating a short-lived voice connection…",
      },
      listening: {
        title: "I’m listening",
        detail: "Speak naturally. Pause when you want me to respond.",
      },
      thinking: {
        title: "Connecting the evidence",
        detail: "Turning your request into a grounded research plan.",
      },
      working: {
        title: "Research in progress",
        detail: "Approved tools are gathering and validating sources.",
      },
      speaking: {
        title: "Here’s what I found",
        detail: "Interrupt at any time or continue in text below.",
      },
      error: {
        title: "Voice needs attention",
        detail: "Use the message above to fix the connection, then try again.",
      },
    };

  const copy = stateCopy[status];

  return (
    <div className="flex w-full flex-col items-center gap-6 px-5 text-center">
      <div className="relative grid size-52 place-items-center sm:size-60">
        {/* Ambient rings */}        
        <span
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-transparent",
            isAnimating && "animate-clay-breathe",
          )}
          aria-hidden="true"
        />
        <span
          className="absolute inset-6 rounded-full border border-border/60 bg-gradient-to-b from-card to-secondary/80 shadow-xl"
          aria-hidden="true"
        />
        {isAnimating && (
          <span
            className="absolute inset-10 rounded-full border-2 border-primary/40 animate-status-ring"
            aria-hidden="true"
          />
        )}
        {isAnimating && (
          <span
            className="absolute inset-14 rounded-full border border-primary/20 animate-status-ring [animation-delay:0.5s]"
            aria-hidden="true"
          />
        )}
        <Button
          size="icon"
          onClick={isConnected ? onToggleMute : onConnect}
          className={cn(
            "relative size-36 rounded-full border-4 border-white/10 bg-gradient-to-br from-primary to-[#6d28d9] text-primary-foreground shadow-2xl shadow-primary/30 transition-all duration-300 hover:scale-[1.04] hover:shadow-primary/45 sm:size-40",
            status === "error" && "from-destructive to-destructive/80 hover:shadow-destructive/30",
            isMuted && "from-muted-foreground to-muted-foreground/80",
          )}
          aria-label={
            !isConnected
              ? "Start voice agent"
              : isMuted
                ? "Unmute microphone"
                : "Mute microphone"
          }
        >
          {status === "connecting" ? (
            <LoaderCircle className="size-12 animate-spin" />
          ) : !isConnected ? (
            <Mic className="size-12" />
          ) : isMuted ? (
            <MicOff className="size-10" />
          ) : status === "speaking" ? (
            <AudioWaveform className="size-12" />
          ) : (
            <div className="flex h-12 items-end gap-1.5" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  className="w-2 rounded-full bg-primary-foreground animate-voice-pulse"
                  style={{
                    height: `${38 + bar * 10}%`,
                    animationDelay: `${bar * 0.12}s`,
                  }}
                />
              ))}
            </div>
          )}
        </Button>
      </div>

      <div className="max-w-sm">
        <p className="font-sans text-2xl font-semibold tracking-tight sm:text-3xl">
          {isMuted ? "Microphone muted" : copy.title}
        </p>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          {isMuted ? "Unmute when you’re ready to continue." : copy.detail}
        </p>
      </div>

      {isConnected && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onInterrupt}
            className="rounded-xl border border-border/40 shadow-xs"
          >
            <Square className="size-3.5" />
            Stop speaking
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDisconnect}
            className="rounded-xl border-border/40 bg-card/70 shadow-xs hover:bg-secondary"
          >
            <PhoneOff className="size-3.5" />
            End
          </Button>
        </div>
      )}

      <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" aria-hidden="true" />
        Your standard API key stays on the server
      </p>
    </div>
  );
}
