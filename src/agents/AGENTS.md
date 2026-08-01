# Voice agent rules

- Keep agent instructions outcome-first and concise.
- Use `gpt-realtime-2.1` for the live speech-to-speech session.
- Define every function tool with a strict Zod input schema.
- Keep read-only tools separate from paid or mutating tools.
- Set `needsApproval` for research that may spend money and for every write action.
- Return machine-readable, truthful tool results. Accepted is not completed.
- Never read large tables aloud; summarize and update the visual workspace.
- Preserve interruption, transcript, and text-input behavior when changing the voice flow.
