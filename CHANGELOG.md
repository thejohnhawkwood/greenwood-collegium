# Changelog

All notable changes to The Greenwood Collegium are recorded here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project will use [Semantic Versioning](https://semver.org/) once the
first playable package is tagged.

## [Unreleased]

### Added

- Ticket 018: a 30-client localhost load simulation, command-verb process logs, and crash lines that redact database URLs. Chat text is not logged.
- Ticket 017 production Blueprint: pre-deploy `db:migrate`, Render health check on `/health/ready`, environment names, and human-only backup notes. Production refuses to start without Postgres.

### Changed

- `admin audit` now says it lists teacher actions only, not student say, when the classroom log is empty.
- The student invite count is a number field, not a dropdown, so the painted frame cannot close the list before a teacher picks 24 or 30.

### Added

- Teachers can issue 1–30 student invite tokens at once, see each student's Collegian name on the roster, and remove a login from the roster or with `admin roster` / `admin remove`.
- Look and examine describe people from species and gender. Porter and the Practice Dummy have worn, specific looks.

### Changed

- Character creation offers female or male. Non-binary is no longer a choice.

### Added

- Teacher and owner classroom commands: `admin announce`, `admin inspect`, `admin mute`, `admin kick`, and `admin audit`. Role checks stay on the server. Actions write an audit log. Mute is in-memory until the process restarts.
- After sign-in, a player hears a narrator introduction and chooses species, gender, and a given name. The classroom username is no longer the character name.
- `examine porter` describes Porter Bramble. Examine also works on other courtyard fixtures, enemies, nearby Collegians, and a Collegian's login name. `x` is an examine alias. The Practice Dummy is in the South Orchard.

### Fixed

- After a process restart the classic client forgets stored event sequences when the server's boot id changes, so `look` and `help` are not silently dropped while the socket still says connected.
- Signed-in play fetches a short-lived socket ticket over the session cookie and keeps the game socket on HTTP polling, so Render can drop the websocket upgrade without locking teachers and students out of the courtyard.
- The classic command box stays typable during guest play, with a blinking `>` and lantern caret, even while the socket is still connecting.
- Invite tokens are trimmed on accept, and unused tokens stay on the teacher roster until a student uses them.
- Local `pnpm start` loads the repo-root `.env`, so the owner bootstrap token matches the file you saved.
- Development play on the house Wi-Fi: bind `0.0.0.0` and allow private LAN browser origins so kids are not stuck on `127.0.0.1`.

### Added

- Teacher sign-in below the student form, plus a classroom roster of unused invite tokens and the usernames that accepted them. Passwords are never shown.
- A living painted frame around the classic gold CLI: oak trunks that reveal upward on both window edges, pulsing lanterns, and a Gwelf / Redwall arrival of student animals in the corner.
- Ticket 015 Arrival at the Collegium, Porter Bramble's welcome, `help` / `quests`, Level 2, and a teacher playthrough.
- Ticket 014 Ember, focus, burning, and an `ember-burst` event the classic transcript can explain.
- Ticket 013 turn-based practice-dummy combat with victory, infirmary defeat, and deterministic rolls.
- Ticket 012 unique item instances, take/drop/examine/inventory, and an ownership claim.
- Ticket 011 declarative room JSON, content validation, and a twenty-five-room academy.
- Ticket 010 command-id idempotency, authenticated resume, and `session.snapshot`.
- Ticket 009 classroom authentication: owner bootstrap, invites, Argon2id passwords, HttpOnly sessions, and production guest refusal.
- Ticket 008 Drizzle schema, SQL migrations, and account/character repositories.
- Ticket 007 per-connection presence, room `say`, entry/exit notices, and chat rate limits.
- Ticket 006 three-room movement, missing-exit rejection, and first-visit discovery.
- Ticket 005 classic transcript, command input, connection indicator, and history.
- Ticket 004 Socket.IO `look` round trip with a temporary in-memory character.
- Ticket 003 pure `look` command in the game engine (no web or database).
- Ticket 002 shared event envelope, semantic segments, and a Lantern Court `room.snapshot` fixture.
- Ticket 001 TypeScript monorepo scaffold (pnpm, Vite/React, Fastify health, Zod contracts).
- Iteration pillars: ADRs, context pack, devlog, classroom roles, machine and Render runbooks.
- GitHub Actions CI and a health-only Render Blueprint.
- Public open-source repository foundation.
- Product Requirements Document at `docs/PRD.md`.
- MIT license for code and CC BY 4.0 notice for original world and educational text.
- Contributor, conduct, security, and agent documents required by the PRD.

[Unreleased]: https://github.com/thejohnhawkwood/greenwood-collegium/compare/main...HEAD
