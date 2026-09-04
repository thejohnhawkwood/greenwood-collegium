# The Greenwood Collegium

A browser-based, persistent, multiplayer text role-playing game inspired by classic multi-user dungeons. Players create woodland-animal characters, enter an ancient academy of magic, and learn by playing — and by inspecting how the game is built.

This repository is public and open source. It is also a classroom artifact: the Git history, issues, design records, tests, and interface generations are meant to show real iterative software development.

**Current public version:** not yet released (repository foundation)  
**Product owner:** Philip Bird  
**Primary setting:** St. Joseph's Collegiate, Brooks, Alberta  
**License:** [MIT](LICENSE) for code; [CC BY 4.0](docs/CONTENT-LICENSE.md) for original world text and educational documentation

> **Privacy:** This repository never stores student records, real chat logs, production database exports, passwords, or tokens. Gameplay names are fictional or classroom-approved pseudonyms.

---

## What this is

The Greenwood Collegium has three equal purposes:

1. **A real game** that students and the teacher want to return to.
2. **A living classroom example** of algorithms, data structures, client/server communication, persistence, testing, and interface design.
3. **A public proof of work** — not just a finished product, but a credible development story.

The first playable interface is a command-line-style MUD in the browser. Later design sprints improve the same engine with colour, a HUD, panels, a minimap, combat presentation, and eventually a glyph renderer.

**The game engine determines truth. The interface determines presentation.**

```text
GREENWOOD COLLEGIUM
----------------------------------------

Lantern Court

Ancient oak branches arch over a circular courtyard.
Blue lanterns drift between the leaves.

You see:
  Porter Bramble
  Rowan the Hare

Exits: north, east, west

> look fountain

The fountain is carved in the shape of three sleeping mice.
A copper key glints beneath the water.
```

---

## Status

| Item | State |
|---|---|
| Product requirements | Published in [`docs/PRD.md`](docs/PRD.md) |
| Public GitHub repository | This repository |
| Playable client | Not started (Ticket 005) |
| Live deployment | Health-only after you apply `render.yaml` |
| CI | GitHub Actions on pull requests and `main` |
| Interface generations | Classic UI is the first target |

Implementation follows the ticket sequence in [Appendix E of the PRD](docs/PRD.md#appendix-e-initial-implementation-ticket-sequence). Ticket 001 is the empty monorepo scaffold. Start every session from [`docs/context/CURRENT.md`](docs/context/CURRENT.md).

```text
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm --filter @greenwood/server start
```

---

## Architecture

```text
BROWSER
  React Interface
  Command Input
  Transcript
  HUD / Panels / Map / Effects
          |
          | HTTPS + Socket.IO
          |
NODE WEB SERVICE
  Fastify HTTP Server
  Authentication and Sessions
  Socket Gateway
  Command Dispatcher
  Game Application Services
          |
          | calls
          |
PURE GAME ENGINE
  Movement, Combat, Quests, Items, Permissions
          |
          | repositories
          |
POSTGRESQL
  Accounts, Characters, Progress, Inventory, Logs
```

Planned stack: TypeScript, React and Vite, Node.js and Fastify, Socket.IO, PostgreSQL, Drizzle ORM, Zod, Vitest, Playwright, GitHub Actions, and Render. See [Required Technology Stack](docs/PRD.md#14-required-technology-stack).

---

## Release ladder

| Version | Name | Intent |
|---|---|---|
| v0.0 | One Room, One Command | Prove repo, contracts, and one `look` round trip |
| v0.0.2 | Two Players in Lantern Court | Presence, movement, `say` |
| v0.0.3 | Return Tomorrow | PostgreSQL accounts and saved location |
| v0.1 | First Lantern | First complete classroom MVP |
| v0.2 | The Academy Becomes a Game | Schools, HUD, colour, panels |
| v0.3 | The Living Greenwood | Minimap, combat theatre, world events |
| v0.4 | Glyphs Beneath the Boughs | Glyph renderer |
| v1.0 | The Student-Built Collegium | Stable student contribution pipeline |

---

## Classroom and curriculum

The project aligns with Alberta Education Computing Science courses, including CSE1010, CSE1110, CSE1120, CSE1210, CSE1910, CSE2010, CSE2110, CSE2120, CSE2130, CSE2210, CSE3120, and CSE3210. See [Classroom Use and Curriculum Alignment](docs/PRD.md#29-classroom-use-and-curriculum-alignment) and [`docs/curriculum/`](docs/curriculum/).

Students can contribute at different depths: playing, writing rooms, reporting bugs, adding tests, or implementing a single command.

---

## Design sprints

Major interface upgrades start with a written design sprint, not a direct coding request. Records will live in [`docs/design-sprints/`](docs/design-sprints/).

Planned first sprints:

- DS-001 Semantic colour and message categories
- DS-002 Persistent player status
- DS-003 Command assistance and keyboard workflow
- DS-004 Bag and equipment panel
- DS-005 Quest tracker and journal
- DS-006 Discovered-world minimap
- DS-007 Combat frame
- DS-008 Ember text effect
- DS-009 Magic-school visual grammars
- DS-010 Glyph room renderer

---

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md) before opening an issue or pull request.

Classroom mode is the default production shape: no public registration, no private messages, no player-versus-player combat, and no student personal data in this repository.

## Security

See [SECURITY.md](SECURITY.md) for how to report a vulnerability. Do not file public issues for secrets, student data, or exploitable game-admin paths.

## License

- **Code and software:** [MIT License](LICENSE)
- **Original world prose and educational documentation:** [CC BY 4.0](docs/CONTENT-LICENSE.md)
- **Third-party materials:** [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

## Documents

- [Current context](docs/context/CURRENT.md)
- [Product Requirements Document](docs/PRD.md)
- [Devlog](docs/devlog/)
- [Machine setup](docs/dev/machine-setup.md)
- [Render setup](docs/dev/render-setup.md)
- [Classroom roles](docs/classroom/roles.md)
- [Content license (CC BY 4.0)](docs/CONTENT-LICENSE.md)
- [Architecture notes](docs/architecture/)
- [Architecture decision records](docs/adr/)
- [Changelog](CHANGELOG.md)
- [Agent instructions](AGENTS.md)
