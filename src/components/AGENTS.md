# Interface rules

- Voice is the primary control surface; visuals provide evidence and verification.
- Use shadcn/ui primitives and semantic CSS variables.
- Do not hardcode a theme into product components. Theme values belong in `src/app/globals.css` and may be replaced by a tweakcn export.
- Preserve responsive layouts, keyboard navigation, visible focus, accessible labels, and the text fallback.
- Render explicit listening, thinking, working, speaking, error, and approval states.
- Never imply live data is present when a panel uses demo data.
