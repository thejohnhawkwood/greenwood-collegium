# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **Release target:** v0.0 foundation (not playable)
- **Active ticket:** [#1 — Repository foundation](https://github.com/thejohnhawkwood/greenwood-collegium/issues/1)
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** not set yet (health-only; paste `https://….onrender.com` here after the Blueprint applies — no connection strings)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. [`docs/dev/machine-setup.md`](../dev/machine-setup.md) if this machine is new
3. [`docs/adr/0009-health-only-deploy.md`](../adr/0009-health-only-deploy.md) for what Ticket 001 is allowed to ship
4. PRD Appendix E only for the ticket you are executing

## Forbidden this pass

- `look`, rooms, movement, `say`, combat
- Socket.IO
- Drizzle, migrations, or connecting to Postgres from the app
- Playwright
- student accounts, invites, or auth
- merging your own pull request
- pasting Render secrets, `DATABASE_URL`, or student data into Git or chat

## Local verify

```text
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm --filter @greenwood/server start
```

Then open `http://localhost:3000/health/live`.

## After Ticket 001 merges

Next ticket is **002 — Shared event contract**. Nothing else is in scope until that issue is the active one.
