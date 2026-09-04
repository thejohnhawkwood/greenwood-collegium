# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **Release target:** v0.0 foundation (classic UI 0, three rooms, look and movement)
- **Active ticket:** [#7 — Multiplayer presence and say](https://github.com/thejohnhawkwood/greenwood-collegium/issues/7)
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** https://greenwood-collegium.onrender.com (classic look and movement after Ticket 006; no connection strings in this file)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. [`packages/game-engine/AGENTS.md`](../../packages/game-engine/AGENTS.md)
3. [`apps/server/AGENTS.md`](../../apps/server/AGENTS.md)
4. PRD Appendix E Ticket 007

## Forbidden this pass

- Drizzle, migrations, or connecting to Postgres from the app
- Colour, HUD, or glyph presentation (later design sprints)
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

## After Ticket 007

Next ticket is **008 — PostgreSQL and Drizzle**.
