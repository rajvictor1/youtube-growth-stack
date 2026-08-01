import { Circle, LoaderCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VoiceAgentStatus } from "@/hooks/use-realtime-agent";

const statusCopy: Record<VoiceAgentStatus, string> = {
  idle: "Ready",
  connecting: "Connecting",
  listening: "Listening",
  thinking: "Thinking",
  working: "Working",
  speaking: "Speaking",
  error: "Needs attention",
};

export function AgentStatus({ status }: { status: VoiceAgentStatus }) {
  const isActive = ["connecting", "thinking", "working"].includes(status);

  return (
    <Badge
      variant="outline"
      className="h-9 gap-2 rounded-full border border-border/50 bg-card/70 px-3.5 text-xs shadow-xs backdrop-blur-sm"
    >
      {isActive ? (
        <LoaderCircle className="size-3.5 animate-spin text-primary" aria-hidden="true" />
      ) : (
        <Circle
          className={cn(
            "size-2.5 fill-current",
            status === "error" && "text-destructive",
            status === "listening" && "text-primary",
            status === "speaking" && "text-accent-foreground",
            status === "idle" && "text-emerald-400",
          )}
          aria-hidden="true"
        />
      )}
      <span className={cn(
        status === "idle" && "text-emerald-400",
        status === "listening" && "text-primary",
        status === "speaking" && "text-accent-foreground",
        status === "error" && "text-destructive",
      )}>{statusCopy[status]}</span>
    </Badge>
  );
}
