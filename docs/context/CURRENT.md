# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **Release target:** v0.0 foundation (classic UI 0, twenty-five rooms, look, movement, presence, say, inventory)
- **Active ticket:** [#13 — Combat vertical slice](https://github.com/thejohnhawkwood/greenwood-collegium/issues/13)
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** https://greenwood-collegium.onrender.com (no connection strings in this file)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. [`packages/game-engine/AGENTS.md`](../../packages/game-engine/AGENTS.md)
3. ADR-0016
4. PRD Appendix E Ticket 013 and section 10.7

## Forbidden this pass

- Pasting Render secrets, `DATABASE_URL`, passwords, session tokens, or student data into Git or chat
- Requesting or accepting a production database dump
- Enabling public registration
- Colour, HUD, or glyph presentation
- Playwright
- Spells beyond what one complete fight requires (Ticket 014)

The owner authorized CLI merge after CI is green for this setup stretch.

## Local verify

```text
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## After Ticket 013

Next ticket is **014 — Spell and Ember event**.
