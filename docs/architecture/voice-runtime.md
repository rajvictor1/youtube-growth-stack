# Voice runtime

## Model roles

| Role                         | Model                 |
| ---------------------------- | --------------------- |
| Live speech-to-speech agent  | `gpt-realtime-2.1`    |
| Deep asynchronous reasoning  | `gpt-5.6-sol`         |
| Uploaded audio transcription | `gpt-transcribe`      |
| Dedicated live captions      | `gpt-live-transcribe` |
| Chained speech output        | `gpt-4o-mini-tts`     |

## Browser flow

1. The user explicitly starts a voice session.
2. The browser requests `/api/realtime/client-secret`.
3. The server uses `OPENAI_API_KEY` to mint a short-lived client secret and binds a privacy-preserving safety identifier.
4. The browser connects the Agents SDK session over WebRTC.
5. `gpt-realtime-2.1` handles speech, turn taking, interruptions, and tool selection.
6. Tool calls execute through typed application routes.
7. Transcript events update the conversation panel; detailed results update the workspace.

Raw audio is not copied into the local history store and is not persisted to Supabase by default.

## Server environment

Configure these values in the repository-root `.env.local` file or the deployment platform's server environment:

```dotenv
OPENAI_API_KEY=your_standard_server_key
OPENAI_REALTIME_MODEL=gpt-realtime-2.1
```

`OPENAI_API_KEY` must never use a `NEXT_PUBLIC_` prefix or be sent to the browser. The client-secret route uses it only on the server to mint a ten-minute `ek_…` credential. `OPENAI_REALTIME_MODEL` is validated as `gpt-realtime-2.1` so the server-minted session and browser Agents SDK session cannot silently drift to different models.

The browser starts voice only after an explicit user action, generates a local session UUID, and sends that UUID to the route. The server hashes it into the privacy-preserving `OpenAI-Safety-Identifier`; the raw identifier is not sent to OpenAI.

## Failure behavior

- Missing server configuration returns `503` without contacting OpenAI.
- Invalid session identifiers return `400` before minting a credential.
- OpenAI network, rejection, and malformed-response failures return a redacted `502`.
- Receiving a client secret means only that a browser session may connect. It does not mean WebRTC connected or any research job completed.
