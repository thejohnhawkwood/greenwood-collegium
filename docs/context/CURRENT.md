# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **Release target:** v0.0 foundation (classic UI 0, three rooms, look, movement, presence, say)
- **Active ticket:** [#9 — Classroom authentication](https://github.com/thejohnhawkwood/greenwood-collegium/issues/9)
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** https://greenwood-collegium.onrender.com (no connection strings in this file)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. [`apps/server/AGENTS.md`](../../apps/server/AGENTS.md)
3. ADR-0005, ADR-0012
4. PRD 10.1, 14.4, and Appendix E Ticket 009

## Forbidden this pass

- Pasting Render secrets, `DATABASE_URL`, passwords, session tokens, or student data into Git or chat
- Requesting or accepting a production database dump
- Enabling public registration
- Colour, HUD, or glyph presentation
- Playwright
- Reconnection and command idempotency (Ticket 010)

The owner authorized CLI merge after CI is green for this setup stretch.

## Local verify

```text
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## After Ticket 009

Next ticket is **010 — Reconnection and idempotency**.
