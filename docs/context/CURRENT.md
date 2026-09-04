# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **Release target:** v0.0 foundation (classic UI 0, twenty-five rooms, look, movement, presence, say)
- **Active ticket:** [#12 — Inventory vertical slice](https://github.com/thejohnhawkwood/greenwood-collegium/issues/12)
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** https://greenwood-collegium.onrender.com (no connection strings in this file)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. [`packages/content/AGENTS.md`](../../packages/content/AGENTS.md)
3. [`packages/game-engine/AGENTS.md`](../../packages/game-engine/AGENTS.md)
4. PRD Appendix E Ticket 012 and sections 16.5–16.6

## Forbidden this pass

- Pasting Render secrets, `DATABASE_URL`, passwords, session tokens, or student data into Git or chat
- Requesting or accepting a production database dump
- Enabling public registration
- Colour, HUD, or glyph presentation
- Playwright
- Combat (Ticket 013)

The owner authorized CLI merge after CI is green for this setup stretch.

## Local verify

```text
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## After Ticket 012

Next ticket is **013 — Combat vertical slice**.
