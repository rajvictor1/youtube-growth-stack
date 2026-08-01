import type { DashboardSnapshot } from "@/lib/contracts/dashboard";

export const demoDashboardSnapshot: DashboardSnapshot = {
  projectName: "AI Creator Growth",
  generatedAt: "2026-08-01T12:00:00.000Z",
  outliers: [
    {
      id: "video-1",
      title: "I Replaced My Content Team With 7 AI Agents",
      channel: "Future Builder",
      views: 1240000,
      multiplier: 8.4,
      publishedAt: "2026-07-28T10:00:00.000Z",
      thumbnailUrl: "https://i.ytimg.com/vi/demo-1/hqdefault.jpg",
    },
    {
      id: "video-2",
      title: "The AI Workflow Nobody Is Talking About",
      channel: "Creator Systems",
      views: 684000,
      multiplier: 6.1,
      publishedAt: "2026-07-25T10:00:00.000Z",
      thumbnailUrl: "https://i.ytimg.com/vi/demo-2/hqdefault.jpg",
    },
    {
      id: "video-3",
      title: "Build Your Personal AI Operating System",
      channel: "Modern Operator",
      views: 421000,
      multiplier: 4.7,
      publishedAt: "2026-07-22T10:00:00.000Z",
      thumbnailUrl: "https://i.ytimg.com/vi/demo-3/hqdefault.jpg",
    },
  ],
  ideas: [
    {
      id: "idea-1",
      title: "I Gave One AI Agent My Entire YouTube Workflow",
      angle: "A transparent before-and-after build showing the real workflow.",
      evidence: ["video-1", "video-3"],
      score: 92,
      status: "suggested",
    },
    {
      id: "idea-2",
      title: "The Voice-First Content System I Use Every Morning",
      angle: "Demonstrate the system through one complete spoken command.",
      evidence: ["video-2", "video-3"],
      score: 87,
      status: "suggested",
    },
  ],
  signals: [
    {
      label: "Fastest-growing format",
      value: "Build in public",
      detail: "3.2× median velocity",
    },
    {
      label: "Repeated hook",
      value: "I replaced…",
      detail: "Found in 4 outliers",
    },
    {
      label: "Content gap",
      value: "Voice workflows",
      detail: "High demand, low supply",
    },
  ],
};
