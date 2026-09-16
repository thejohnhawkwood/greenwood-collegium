# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **Release target:** v0.0 foundation (twenty-five rooms, look, movement, presence, say, inventory, combat, Ember, Arrival)
- **Shipped visual slices:** DS-002 play shell (ADR-0030), DS-003 world-map fog (ADR-0031), DS-004 painted catalog (ADR-0032). Live play uses room plates, Collegian looks, NPC plates, and clickable object plates. Typed commands stay canonical.
- **Active follow-up:** confirm the live Render deploy, then owner-directed polish. Do **not** start Ticket 019 / DS-001 semantic colour unless the owner says next.
- **Local art pass:** `/?builder=1` (Collegian looks), `/?rooms=1` (room plates), `/?shell=1` (play chrome). Click an NPC or object on the room painting to zoom its full plate to Collegian-portrait size.
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** https://greenwood-collegium.onrender.com (no connection strings in this file)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. Implementation handoff: [`CURSOR-HANDOFF-VISUAL-FOUNDATION.md`](CURSOR-HANDOFF-VISUAL-FOUNDATION.md)
3. Slices: [`../design-sprints/ds-002-visual-foundation.md`](../design-sprints/ds-002-visual-foundation.md), [`ds-003-world-map.md`](../design-sprints/ds-003-world-map.md), [`ds-004-painted-catalog.md`](../design-sprints/ds-004-painted-catalog.md)
4. Class: [`../classroom/class-day.md`](../classroom/class-day.md), [`playthrough.md`](../../playthrough.md)
5. [`apps/server/AGENTS.md`](../../apps/server/AGENTS.md)
6. PRD Appendix E Ticket 019 (DS-001) only if the owner names colour as next.

## Forbidden this pass

- Pasting Render secrets, `DATABASE_URL`, passwords, session tokens, invite tokens, or student data into Git or chat
- Requesting or accepting a production database dump
- Enabling public registration
- Colour, HUD, or glyph presentation beyond the existing semantic text colours
- Playwright
- A second admin service or a competing source of game truth
- Lobby travel (S5) unless the owner names it

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

Visual Cycles A–B and the painted catalog are on `main`. The next product slice is **lobby travel (S5)** or **Ticket 019 — DS-001 semantic colour**. Do not start either unless the owner names it. Immediate human step: walk the live play shell after Render finishes and confirm NPC/object zoom plus punched plates.
