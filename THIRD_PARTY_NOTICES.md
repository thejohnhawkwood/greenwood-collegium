# Third-Party Notices

This file lists third-party materials distributed with The Greenwood Collegium.
Original project code is MIT-licensed. Original world prose and educational
documentation are also available under CC BY 4.0. See [LICENSE](LICENSE).

Runtime and toolchain packages are pinned in `pnpm-lock.yaml`. Ticket 001 added
these so the empty scaffold can typecheck, test, lint, and build:

| Package | Rationale |
|---|---|
| TypeScript | Strict typing across the monorepo |
| pnpm | Workspace installs and scripts |
| React 19 / React DOM | Browser client |
| Vite 8 | Client dev server and production build |
| Fastify 5 | HTTP process and health endpoints |
| Socket.IO 4 | Command and event transport (Ticket 004) |
| Drizzle ORM / Drizzle Kit | Typed queries and SQL migrations (Ticket 008) |
| pg | Render-compatible PostgreSQL 18 driver |
| @fastify/static | Serve the built web client from the same origin |
| Zod 4 | Shared contracts |
| Vitest | Unit and contract tests |
| ESLint / typescript-eslint | Lint TypeScript and React |
| Prettier | Formatting |
| @vitejs/plugin-react | Vite React transform |
| Pino (via Fastify) | Structured logs |

Exact versions and licenses are in the lockfile and each package's npm listing.

## Documents adapted for this repository

| Material | License | Notes |
|---|---|---|
| [Contributor Covenant](https://www.contributor-covenant.org/) 2.1 | CC BY 4.0 | Adapted in `CODE_OF_CONDUCT.md` |
| [Keep a Changelog](https://keepachangelog.com/) format | CC BY 4.0 | Used as the changelog structure |

## Assets

The repository does not currently include third-party art, fonts beyond those
available through ordinary system or open-licensed stacks, audio, or scraped
wiki content.

Do not add copyrighted franchise text, logos, maps, or distinctive copied game
rules. Inspiration may be described in project-history documents; public game
content must be original or appropriately licensed.
