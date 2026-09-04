# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **Release target:** v0.0 foundation (not playable in the browser yet)
- **Active ticket:** [#4 — Fastify and Socket.IO round trip](https://github.com/thejohnhawkwood/greenwood-collegium/issues/4)
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** https://greenwood-collegium.onrender.com (health-only; no connection strings in this file)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. [`apps/server/AGENTS.md`](../../apps/server/AGENTS.md)
3. [`packages/game-engine/AGENTS.md`](../../packages/game-engine/AGENTS.md)
4. PRD Appendix E Ticket 004

## Forbidden this pass

- React gameplay UI beyond delivering events (Ticket 005 owns the classic transcript)
- Movement between rooms (Ticket 006)
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

## After Ticket 004

Next ticket is **005 — Classic React client**.
