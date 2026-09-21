# @greenwood/web

React client. Typed commands are the canonical player interaction.

- Ticket 005 owns the classic transcript, command input, connection indicator, and history.
- The command box stays enabled so a guest can type. Submit still waits for a connected socket. The live client stays on polling and sends a server-issued socket ticket so production play does not depend on a websocket cookie.
- Ticket 009 owns the sign-in gate. Production play requires a session cookie. Guest play remains for local development.
- The student invite count is a number field. Clicks on buttons and fields must not steal focus into the command box.
- After sign-in, an incomplete account sees the character-creation gate. The client does not invent species, gender, or name authority.
- Student and teacher sign-in are separate forms. The right-hand teacher pane renders `/auth/classroom` and staff-only `/admin/*` controls. It never invents tokens, approvals, restrictions, or game outcomes, and never shows passwords.
- Ticket 015 owns the first-time teacher bootstrap copy. The client still does not invent quest or level outcomes.
- Ticket 010 owns reconnect: ignore already-applied sequences, retry an unacked command with the same id. A new `session-hello` boot id means the process restarted; forget the stored sequence.
- React components never contain game rules. Render validated semantic segments only when they reproduce `event.narration` exactly; otherwise render the plain narration. Entity categories come from the server.
- Do not invent authoritative outcomes from the client.
- The owner retired the separate classic UI requirement in ADR-0028. Keep typed commands, complete plain narration, keyboard access, and non-colour cues. No Tailwind or component library.
- Students wait outside the realm until both names are approved. Rejected submissions return to character creation with teacher feedback; timeouts show a waiting screen until the server allows entry.
- New events must not move a transcript reader who has scrolled up. Show an explicit jump-to-latest button and preserve text selection.
- The living frame is presentation only. It must not hide command input or invent game text. Presence plates come from the current room only. Conversation overlays must not keep an NPC on the painting after that NPC leaves the scene.
- The compact minimap shows the current floor. The world map can change floors with Up and Down, and can send `up` / `down` when those exits exist.
- CombatStage renders `play-state.encounter` only: foe plate or classmate look, name, health, focus, the lock clock, and buttons that send the projected commands. Overlay FX decorate the latest `combat.action_resolved` event and current foe vitals. They do not invent damage, focus spend, or legal moves. PrimerStage renders `play-state.primer` only: three cards with the offered title, numbers, and description. Clicking a card sends `1`, `2`, or `3`. Presence may send `duel <name>`. The world map sends `travel <title>` for explored rooms on the chart and in the explored list.
- Open `/?builder=1` to compare Collegian looks, `/?rooms=1` to compare room plates,
  `/?shell=1` to review the play layout, and `/?shell=1&primer=1` to review Primer cards.
  Those harnesses do not invent game outcomes.
