import { z } from "zod";

export const outlierVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  channel: z.string(),
  views: z.number().nonnegative(),
  multiplier: z.number().positive(),
  publishedAt: z.string(),
  thumbnailUrl: z.string(),
});

export const contentIdeaSchema = z.object({
  id: z.string(),
  title: z.string(),
  angle: z.string(),
  evidence: z.array(z.string()),
  score: z.number().min(0).max(100),
  status: z.enum(["suggested", "saved", "drafting"]),
});

export const dashboardSnapshotSchema = z.object({
  projectName: z.string(),
  generatedAt: z.string(),
  outliers: z.array(outlierVideoSchema),
  ideas: z.array(contentIdeaSchema),
  signals: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      detail: z.string(),
    }),
  ),
});

export type OutlierVideo = z.infer<typeof outlierVideoSchema>;
export type ContentIdea = z.infer<typeof contentIdeaSchema>;
export type DashboardSnapshot = z.infer<typeof dashboardSnapshotSchema>;
