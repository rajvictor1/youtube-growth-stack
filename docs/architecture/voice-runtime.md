# Voice runtime

## Model roles

| Role | Model |
|---|---|
| Live speech-to-speech agent | `gpt-realtime-2.1` |
| Deep asynchronous reasoning | `gpt-5.6-sol` |
| Uploaded audio transcription | `gpt-transcribe` |
| Dedicated live captions | `gpt-live-transcribe` |
| Chained speech output | `gpt-4o-mini-tts` |

## Browser flow

1. The user explicitly starts a voice session.
2. The browser requests `/api/realtime/client-secret`.
3. The server uses `OPENAI_API_KEY` to mint a short-lived client secret and binds a privacy-preserving safety identifier.
4. The browser connects the Agents SDK session over WebRTC.
5. `gpt-realtime-2.1` handles speech, turn taking, interruptions, and tool selection.
6. Tool calls execute through typed application routes.
7. Transcript events update the conversation panel; detailed results update the workspace.

Raw audio is not copied into the local history store and is not persisted to Supabase by default.
