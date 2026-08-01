import { RealtimeAgent } from "@openai/agents/realtime";

import { YOUTUBE_GROWTH_AGENT_INSTRUCTIONS } from "@/agents/instructions";
import { createGrowthAgentTools } from "@/agents/tools";

type ToolEventHandler = Parameters<typeof createGrowthAgentTools>[0];

export function createYouTubeGrowthAgent(onToolEvent?: ToolEventHandler) {
  return new RealtimeAgent({
    name: "YouTube Growth Agent",
    voice: "marin",
    instructions: YOUTUBE_GROWTH_AGENT_INSTRUCTIONS,
    tools: createGrowthAgentTools(onToolEvent),
  });
}
