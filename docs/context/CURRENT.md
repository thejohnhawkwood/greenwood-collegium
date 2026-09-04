# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **Release target:** v0.0 foundation (classic UI 0, three rooms, look, movement, presence, say)
- **Active ticket:** [#10 — Reconnection and idempotency](https://github.com/thejohnhawkwood/greenwood-collegium/issues/10)
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** https://greenwood-collegium.onrender.com (no connection strings in this file)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. [`apps/server/AGENTS.md`](../../apps/server/AGENTS.md)
3. ADR-0002, ADR-0013
4. PRD Appendix E Ticket 010

## Forbidden this pass

- Pasting Render secrets, `DATABASE_URL`, passwords, session tokens, or student data into Git or chat
- Requesting or accepting a production database dump
- Enabling public registration
- Colour, HUD, or glyph presentation
- Playwright
- Content loader, inventory, or combat (Tickets 011–013)

The owner authorized CLI merge after CI is green for this setup stretch.

## Local verify

```text
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## After Ticket 010

Next ticket is **011 — Content loader**.
