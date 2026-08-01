import { describe, expect, it } from "vitest";
import type { RealtimeItem } from "@openai/agents/realtime";

import { historyToTranscript } from "@/lib/realtime/history";

describe("historyToTranscript", () => {
  it("normalizes text and audio transcripts", () => {
    const history: RealtimeItem[] = [
      {
        itemId: "user-1",
        type: "message",
        role: "user",
        status: "completed",
        content: [
          { type: "input_audio", audio: null, transcript: "Find outliers" },
        ],
      },
      {
        itemId: "assistant-1",
        type: "message",
        role: "assistant",
        status: "completed",
        content: [{ type: "output_text", text: "I found three." }],
      },
    ];

    expect(historyToTranscript(history)).toEqual([
      {
        id: "user-1",
        role: "user",
        status: "completed",
        text: "Find outliers",
      },
      {
        id: "assistant-1",
        role: "assistant",
        status: "completed",
        text: "I found three.",
      },
    ]);
  });

  it("omits tool calls and empty partial messages", () => {
    const history: RealtimeItem[] = [
      {
        itemId: "tool-1",
        type: "function_call",
        status: "completed",
        arguments: "{}",
        name: "get_dashboard_snapshot",
        output: "{}",
      },
      {
        itemId: "assistant-empty",
        type: "message",
        role: "assistant",
        status: "in_progress",
        content: [{ type: "output_audio", audio: null, transcript: null }],
      },
    ];

    expect(historyToTranscript(history)).toEqual([]);
  });
});
