# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **Release target:** v0.0 foundation (classic UI 0, twenty-five rooms, look, movement, presence, say, inventory, combat, Ember, Arrival)
- **Active ticket:** [#16 — Teacher Controls and Moderation](https://github.com/thejohnhawkwood/greenwood-collegium/issues/16)
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** https://greenwood-collegium.onrender.com (no connection strings in this file)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. [`playthrough.md`](../../playthrough.md)
3. [`apps/server/AGENTS.md`](../../apps/server/AGENTS.md)
4. ADR-0013 and ADR-0019
5. PRD Appendix E Ticket 016 and classroom safety sections

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

## After Ticket 016

Next ticket is **017 — Render Blueprint and Production Readiness**.
