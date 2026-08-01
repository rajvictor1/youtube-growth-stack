import {
  AudioWaveform,
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

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative grid size-28 place-items-center sm:size-32">
        {isAnimating && (
          <span
            className="absolute inset-2 rounded-full border border-primary/35 [animation:status-ring_1.8s_ease-out_infinite]"
            aria-hidden="true"
          />
        )}
        <Button
          size="icon"
          onClick={isConnected ? onToggleMute : onConnect}
          className={cn(
            "relative size-24 rounded-full shadow-xl transition-transform hover:scale-[1.03] sm:size-28",
            status === "speaking" && "bg-sky-600 hover:bg-sky-600/90",
            status === "listening" && "bg-emerald-600 hover:bg-emerald-600/90",
          )}
          aria-label={
            !isConnected
              ? "Start voice agent"
              : isMuted
                ? "Unmute microphone"
                : "Mute microphone"
          }
        >
          {!isConnected ? (
            <Mic className="size-9" />
          ) : isMuted ? (
            <MicOff className="size-9" />
          ) : status === "speaking" ? (
            <AudioWaveform className="size-10" />
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

      <div className="text-center">
        <p className="text-sm font-medium">
          {!isConnected
            ? "Start voice session"
            : isMuted
              ? "Microphone muted"
              : status === "speaking"
                ? "Agent is speaking"
                : "Talk naturally"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Your standard API key never enters the browser.
        </p>
      </div>

      {isConnected && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onInterrupt}>
            <Square className="size-3.5" />
            Stop speaking
          </Button>
          <Button variant="ghost" size="sm" onClick={onDisconnect}>
            <PhoneOff className="size-3.5" />
            End
          </Button>
        </div>
      )}
    </div>
  );
}
