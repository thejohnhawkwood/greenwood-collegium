# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **Release target:** v0.0 foundation (twenty-five rooms, look, movement, travel, presence, say, inventory, combat, Ember, Arrival)
- **Shipped slices:** DS-001 semantic colour (ADR-0028), DS-002 play shell (ADR-0030), DS-003 world-map fog (ADR-0031), DS-004 painted catalog (ADR-0032), DS-005 lobby travel (ADR-0033). Typed commands stay canonical.
- **Active follow-up:** confirm the live Render deploy. Do not start a new interface sprint unless the owner names it.
- **Local art pass:** `/?builder=1`, `/?rooms=1`, `/?shell=1` (lobby opens first; Enter play, then Lobby in the header). Instructor Flint is a veteran hare, not a nursery bunny. Click a token for the commands that work on it.
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** https://greenwood-collegium.onrender.com (no connection strings in this file)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. Implementation handoff: [`CURSOR-HANDOFF-VISUAL-FOUNDATION.md`](CURSOR-HANDOFF-VISUAL-FOUNDATION.md)
3. Slices: DS-001 through DS-005 under [`../design-sprints/`](../design-sprints/)
4. Class: [`../classroom/class-day.md`](../classroom/class-day.md), [`playthrough.md`](../../playthrough.md)
5. [`apps/server/AGENTS.md`](../../apps/server/AGENTS.md)

## Forbidden this pass

- Pasting Render secrets, `DATABASE_URL`, passwords, session tokens, invite tokens, or student data into Git or chat
- Requesting or accepting a production database dump
- Enabling public registration
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

## After Ticket 018

Ticket 018 is the 30-client localhost simulation plus crash-safe process logs. The next school period is the live load test. Do not point the simulation at Render. Edit on `class-2026-09-08`. Do not merge to `main` while the class is connected.

Visual Cycles A–C, the painted catalog, and DS-001 colour are on `main` after this pass. Immediate human step: walk the live lobby, `travel`, and a `[SYSTEM]` line after Render finishes.
