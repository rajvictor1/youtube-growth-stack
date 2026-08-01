import { tool } from "@openai/agents/realtime";

import {
  getDashboardSnapshotInputSchema,
  agentToolResultSchemas,
  saveContentIdeaInputSchema,
  startCompetitorResearchInputSchema,
  type AgentToolRequest,
  type AgentToolResultMap,
} from "@/lib/contracts/agent-tools";
import { externalResearchSourceInputSchema } from "@/lib/contracts/external-research";

export type ToolEvent = {
  [Action in AgentToolRequest["action"]]: {
    action: Action;
    result: AgentToolResultMap[Action];
  };
}[AgentToolRequest["action"]];

async function callToolApi<Action extends AgentToolRequest["action"]>(
  request: Extract<AgentToolRequest, { action: Action }>,
): Promise<AgentToolResultMap[Action]> {
  const response = await fetch("/api/tools", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const result: unknown = await response.json();

  if (!response.ok) {
    throw new Error("The application tool could not complete the request.");
  }

  const parsed = agentToolResultSchemas[request.action].safeParse(result);
  if (!parsed.success) {
    throw new Error("The application tool returned an invalid response.");
  }

  return parsed.data as AgentToolResultMap[Action];
}

export function createGrowthAgentTools(
  onToolEvent?: (event: ToolEvent) => void,
) {
  return [
    tool({
      name: "get_dashboard_snapshot",
      description:
        "Read the current project dashboard, including outlier videos, content signals, and suggested ideas.",
      parameters: getDashboardSnapshotInputSchema,
      execute: async () => {
        const result = await callToolApi({
          action: "get_dashboard_snapshot",
          payload: {},
        });
        onToolEvent?.({ action: "get_dashboard_snapshot", result });
        return JSON.stringify(result);
      },
    }),
    tool({
      name: "start_competitor_research",
      description:
        "Start a potentially paid, long-running competitor research job. Use only after the user asks to begin new research.",
      parameters: startCompetitorResearchInputSchema,
      needsApproval: true,
      execute: async (payload) => {
        const result = await callToolApi({
          action: "start_competitor_research",
          payload,
        });
        onToolEvent?.({ action: "start_competitor_research", result });
        return JSON.stringify(result);
      },
    }),
    tool({
      name: "research_external_source",
      description:
        "Read one public web page for supporting channel, competitor, or topic research. This uses Firecrawl credits and does not provide authoritative YouTube metrics.",
      parameters: externalResearchSourceInputSchema,
      needsApproval: true,
      execute: async (payload) => {
        const result = await callToolApi({
          action: "research_external_source",
          payload,
        });
        onToolEvent?.({ action: "research_external_source", result });
        return JSON.stringify(result);
      },
    }),
    tool({
      name: "save_content_idea",
      description:
        "Save one explicit video idea to the project idea board. This is a write action and requires user approval.",
      parameters: saveContentIdeaInputSchema,
      needsApproval: true,
      execute: async (payload) => {
        const result = await callToolApi({
          action: "save_content_idea",
          payload,
        });
        onToolEvent?.({ action: "save_content_idea", result });
        return JSON.stringify(result);
      },
    }),
  ];
}
