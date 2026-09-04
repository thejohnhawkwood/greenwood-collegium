# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **Release target:** v0.0 foundation (one-room look over the socket; classic UI not done)
- **Active ticket:** [#5 — Classic React client](https://github.com/thejohnhawkwood/greenwood-collegium/issues/5)
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** https://greenwood-collegium.onrender.com (look proof after Ticket 004; no connection strings in this file)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. [`apps/web/AGENTS.md`](../../apps/web/AGENTS.md)
3. [`apps/server/AGENTS.md`](../../apps/server/AGENTS.md)
4. PRD Appendix E Ticket 005 and ADR-0006

## Forbidden this pass

- Movement between rooms (Ticket 006)
- Colour, HUD, or glyph presentation (later design sprints)
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

## After Ticket 005

Next ticket is **006 — Three-room movement**.
