# Foundation progress

- The product uses a voice-first interaction layer with a visual evidence canvas.
- `gpt-realtime-2.1` is the live conversation model.
- Browser Realtime access uses a short-lived server-minted client secret.
- Raw microphone audio is not persisted by default.
- The job boundary remains provider-neutral until a production queue adapter is verified.
- tweakcn theme values will replace semantic tokens after the preferred export is supplied.
- The Realtime boundary now validates both OpenAI's client-secret response and the browser-facing response, binds a hashed session UUID as the safety identifier, and keeps the standard API key in a `server-only` module.
- Agent tool requests and results are validated at both application-route and browser-agent boundaries; queued and configuration-required jobs cannot be parsed as completed work.
- A live server-side client-secret probe reached OpenAI on 2026-08-01 but the provisioned key was rejected with upstream `401`; no live Realtime connection is verified until credentials are corrected and the probe succeeds.
