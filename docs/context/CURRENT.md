# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **Release target:** v0.0 foundation (twenty-five rooms, look, movement, travel, presence, say, inventory, combat, Ember, Arrival)
- **Shipped slices:** DS-001 semantic colour (ADR-0028), visual DS-002–005 play shell / map / plates / lobby, classic DS-002 status, DS-003 command assistance, DS-004 bag, DS-006 minimap. Typed commands stay canonical.
- **Active follow-up:** confirm live Arrival. Porter’s welcome and replies sit on the painting. The story log should stay look/move description. Do not start DS-005 or DS-007 unless the owner names it.
- **Local art pass:** `/?builder=1`, `/?rooms=1`, `/?shell=1` (lobby opens first; Enter play, then Lobby in the header). The preview now shows a conversation stage and bag items.
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

Conversation choices sit on the room painting; Inventory opens the bag; Tab and the reminder strip assist typed commands. Immediate human step: talk, pick a choice, open the bag, then confirm the story log jumped.
