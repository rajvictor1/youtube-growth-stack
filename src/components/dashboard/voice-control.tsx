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
    <div className="flex w-full flex-col items-center gap-5 px-5 text-center">
      <div className="relative grid size-48 place-items-center sm:size-56">
        <span
          className={cn(
            "absolute inset-0 rounded-full bg-primary/10 shadow-inner",
            isAnimating && "[animation:clay-breathe_2.4s_ease-in-out_infinite]",
          )}
          aria-hidden="true"
        />
        <span
          className="absolute inset-5 rounded-full border border-card/80 bg-secondary/70 shadow-lg"
          aria-hidden="true"
        />
        {isAnimating && (
          <span
            className="absolute inset-8 rounded-full border-2 border-primary/30 [animation:status-ring_1.8s_ease-out_infinite]"
            aria-hidden="true"
          />
        )}
        <Button
          size="icon"
          onClick={isConnected ? onToggleMute : onConnect}
          className={cn(
            "relative size-32 rounded-full border-8 border-primary-foreground/20 shadow-2xl transition-[transform,box-shadow] duration-300 hover:scale-[1.025] hover:shadow-xl sm:size-36",
            status === "error" && "bg-destructive hover:bg-destructive/90",
            isMuted && "bg-muted-foreground hover:bg-muted-foreground/90",
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
            <LoaderCircle className="size-11 animate-spin" />
          ) : !isConnected ? (
            <Mic className="size-11" />
          ) : isMuted ? (
            <MicOff className="size-9" />
          ) : status === "speaking" ? (
            <AudioWaveform className="size-12" />
          ) : (
            <div className="flex h-10 items-center gap-1" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((bar) => (
                <span
                  key={bar}
                  className="h-8 w-1.5 rounded-full bg-primary-foreground"
                  style={{
                    animation: `voice-pulse 0.9s ${bar * 0.1}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          )}
        </Button>
      </div>

      <div className="max-w-sm">
        <p className="font-serif text-2xl font-semibold tracking-tight">
          {isMuted ? "Microphone muted" : copy.title}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {isMuted ? "Unmute when you’re ready to continue." : copy.detail}
        </p>
      </div>

      {isConnected && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onInterrupt}
            className="shadow-xs"
          >
            <Square className="size-3.5" />
            Stop speaking
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDisconnect}
            className="bg-card shadow-xs"
          >
            <PhoneOff className="size-3.5" />
            End
          </Button>
        </div>
      )}

      <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
        Your standard API key stays on the server
      </p>
    </div>
  );
}
