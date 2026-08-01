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
      className="h-8 gap-2 rounded-full border-0 bg-card px-3 text-xs shadow-xs"
    >
      {isActive ? (
        <LoaderCircle className="size-3 animate-spin" aria-hidden="true" />
      ) : (
        <Circle
          className={cn(
            "size-2.5 fill-current",
            status === "error" && "text-destructive",
            status === "listening" && "text-primary",
            status === "speaking" && "text-accent-foreground",
          )}
          aria-hidden="true"
        />
      )}
      {statusCopy[status]}
    </Badge>
  );
}
