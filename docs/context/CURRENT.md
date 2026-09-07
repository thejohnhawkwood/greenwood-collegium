# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **Release target:** v0.0 foundation (classic UI 0, twenty-five rooms, look, movement, presence, say, inventory, combat, Ember, Arrival)
- **Active ticket:** [#18 — Classroom Load Test](https://github.com/thejohnhawkwood/greenwood-collegium/issues/18)
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** https://greenwood-collegium.onrender.com (no connection strings in this file)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. [`playthrough.md`](../../playthrough.md)
3. [`apps/server/AGENTS.md`](../../apps/server/AGENTS.md)
4. ADR-0013 and ADR-0019
5. PRD Appendix E Ticket 018. Ticket 017 notes: [`docs/dev/render-setup.md`](../dev/render-setup.md), [`docs/ops/backup-restore.md`](../ops/backup-restore.md), ADR-0024.

## Forbidden this pass

- Pasting Render secrets, `DATABASE_URL`, passwords, session tokens, invite tokens, or student data into Git or chat
- Requesting or accepting a production database dump
- Enabling public registration
- Colour, HUD, or glyph presentation
- Playwright
- A second admin service or a competing source of game truth

The owner authorized CLI merge after CI is green for this setup stretch.

## Local verify

```text
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## After Ticket 017

Ticket 017 is the production Blueprint: pre-deploy migrate, `/health/ready`, no memory fallback in production, backup notes.

Next ticket is **018 — Classroom Load Test**. Do not start it unless the owner says next.
