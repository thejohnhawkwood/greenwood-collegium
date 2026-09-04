# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **Release target:** v0.0 foundation (not playable)
- **Active ticket:** [#2 — Shared event contract](https://github.com/thejohnhawkwood/greenwood-collegium/issues/2)
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** https://greenwood-collegium.onrender.com (health-only; no connection strings in this file)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. [`docs/adr/0002-server-authoritative-events.md`](../adr/0002-server-authoritative-events.md)
3. [`packages/contracts/AGENTS.md`](../../packages/contracts/AGENTS.md)
4. PRD section 16 and Appendix E Ticket 002

## Forbidden this pass

- `look` engine (Ticket 003)
- Socket.IO (Ticket 004)
- React gameplay UI (Ticket 005)
- Drizzle, migrations, or connecting to Postgres from the app
- Playwright
- student accounts, invites, or auth
- pasting Render secrets, `DATABASE_URL`, or student data into Git or chat

The owner authorized CLI merge after CI is green for this setup stretch.

## Local verify

```text
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## After Ticket 002

Next ticket is **003 — Pure one-room engine**. `look` stays in the engine package with no web or database dependency.
