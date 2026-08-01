# Data model

The initial Supabase migration creates these groups:

- Identity: `profiles`
- Workspace: `projects`, `competitors`
- Source data: `videos`, `video_metrics`, `transcripts`, `research_sources`
- Processing: `ingestion_runs`, `insights`
- Output: `ideas`
- Conversation: `conversations`, `messages`, `tool_runs`

Every domain row carries `project_id`. Row-level security checks that the signed-in user owns the project. Workers use the service role only from trusted server environments.

Source provenance stays attached to research and idea evidence. The application must be able to distinguish an observed metric from an inferred explanation.
