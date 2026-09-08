# @greenwood/server

Fastify process for HTTP and Socket.IO.

- Socket handlers coordinate. They call the engine. They do not invent room text.
- Ignore client-supplied account, role, or character fields. Production sockets require a completed Collegian plus a session cookie or a short-lived server-issued socket ticket. Development and tests may still assign an unused in-memory guest.
- Validate command payloads with Zod before calling engine handlers.
- Persist critical mutations before acknowledging success (Ticket 008+).
- Ticket 012 persists unique item ownership with a conditional claim. A failed claim must not stay taken in memory. Persist a personal Arrival key with `ensurePlacements` before that take can `claim`.
- Ticket 013 owns combat command dispatch. Socket handlers do not invent combat text or damage.
- Ticket 014 owns `cast`. Handlers do not invent Ember damage, burning, or presentation.
- Ticket 015 owns Arrival, `help`, and `quests`. Handlers do not invent Porter speech or award XP twice.
- Repeat command IDs must return the first result. Authenticated disconnects get a resume grace and `session.snapshot`.
- Each process emits `session-hello` with a boot id on connect. Do not log the boot id as a secret; it is not a session token.
- Account and character records use repository interfaces. In-memory tests always run. Postgres tests run only with `GREENWOOD_TEST_DATABASE_URL`.
- Owner and teacher may read unused invite tokens, accepted usernames, and Collegian names on `GET /auth/classroom`. Students may not. Passwords never appear in that payload. Teachers may issue a batch of unused student tokens.
- Ticket 016 owns classroom commands. Socket handlers check owner/teacher from the session, apply mute and kick, and append an audit row. They do not invent announce text beyond the validated plain-text line. Never log session tokens, invite tokens, or socket tickets.
- Production requires a reachable Postgres. Do not fall back to memory when `NODE_ENV=production`. `pnpm --filter @greenwood/server db:migrate` is the pre-deploy migration command.
- Process logs may include command verb, status, duration, and connected count. Never log raw command text, `say` lines, tickets, cookies, or `DATABASE_URL`. The 30-client load simulation stays on localhost.
- Never log `DATABASE_URL`, passwords, session tokens, invite tokens, socket tickets, or read a production dump.
- `pnpm start` loads the repo-root `.env` when that file exists. Do not print secret values.
- Development may accept private LAN origins so household devices can play. Production may not.
