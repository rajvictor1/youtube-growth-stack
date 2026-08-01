# ADR 0001: Use OpenAI Realtime as the primary interaction layer

## Status

Accepted.

## Decision

Use `gpt-realtime-2.1` through the OpenAI Agents SDK and WebRTC for live browser conversation. Use separate transcription models only for file uploads or dedicated caption workflows.

## Why

The product needs natural turn-taking, interruption, low first-audio latency, spoken responses, and tool use. A manual speech-to-text → text model → text-to-speech chain adds latency and makes interruptions harder.

## Consequences

- The server must mint short-lived Realtime client secrets.
- Text chat shares the Realtime session.
- The visual workspace must remain useful when audio is unavailable.
- Long-running analysis still belongs in background jobs and may use a deeper reasoning model.
