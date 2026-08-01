import type { RealtimeItem } from "@openai/agents/realtime";

export type TranscriptMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  status: "in_progress" | "completed" | "incomplete";
};

export function historyToTranscript(
  history: RealtimeItem[],
): TranscriptMessage[] {
  return history.flatMap((item) => {
    if (item.type !== "message" || item.role === "system") {
      return [];
    }

    const text = item.content
      .map((content) => {
        if (content.type === "input_text" || content.type === "output_text") {
          return content.text;
        }

        if (
          content.type === "input_audio" ||
          content.type === "output_audio"
        ) {
          return content.transcript ?? "";
        }

        return "";
      })
      .join(" ")
      .trim();

    if (!text) {
      return [];
    }

    return [
      {
        id: item.itemId,
        role: item.role,
        text,
        status: item.status,
      },
    ];
  });
}
