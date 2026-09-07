# @greenwood/web

React client. Typed commands are the canonical player interaction.

- Ticket 005 owns the classic transcript, command input, connection indicator, and history.
- The command box stays enabled so a guest can type. Submit still waits for a connected socket. The live client stays on polling and sends a server-issued socket ticket so production play does not depend on a websocket cookie.
- Ticket 009 owns the sign-in gate. Production play requires a session cookie. Guest play remains for local development.
- After sign-in, an incomplete account sees the character-creation gate. The client does not invent species, gender, or name authority.
- Student and teacher sign-in are separate forms. The teacher roster renders `/auth/classroom`. It never invents tokens or shows passwords. The client may choose how many student invites to request. Remove calls `/auth/disable`.
- Ticket 015 owns the first-time teacher bootstrap copy. The client still does not invent quest or level outcomes.
- Ticket 010 owns reconnect: ignore already-applied sequences, retry an unacked command with the same id.
- React components never contain game rules. Render `event.narration` with `renderClassicNarration`.
- Do not invent authoritative outcomes from the client.
- Keep classic mode possible. No Tailwind or component library.
- The living frame is presentation only. It must not hide command input or invent game text.
