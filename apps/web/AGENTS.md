# @greenwood/web

React client. Typed commands are the canonical player interaction.

- Ticket 005 owns the classic transcript, command input, connection indicator, and history.
- Ticket 009 owns the sign-in gate. Production play requires a session cookie. Guest play remains for local development.
- React components never contain game rules. Render `event.narration` with `renderClassicNarration`.
- Do not invent authoritative outcomes from the client.
- Keep classic mode possible. No Tailwind or component library.
