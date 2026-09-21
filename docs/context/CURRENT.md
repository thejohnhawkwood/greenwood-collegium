# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **HEAD / live:** `8db0457` on `main` (21 September 2026 Field Primer merge). CI green. Render deploy success. `/health/ready` ok. Bundle `index-D9WwdtE4.js`.
- **Release target:** v0.0 foundation (thirty-eight mapped rooms on four floors, look, movement, travel, presence, say, inventory, combat, Ember, Arrival, Schools, level-3 kits)
- **Shipped on this HEAD:** Field Primer ranks 1–5, college 1–5 teacher-and-dummy, three clickable Primer cards after the first three leaves (typed 1/2/3 stay canonical), seven leaves per School, published XP table to lesson 20 ([ADR-0039](../adr/0039-field-primer.md)). Personal Primer item. Six hearth dummies stay up with the orchard dummy ([ADR-0037](../adr/0037-first-time-spawns.md)). `stats` shows School, leaves, and next lesson. Preview: `/?shell=1&primer=1`.
- **In the live game, not yet built:** rooms for lessons 11–20. Shop, Strength, type chart, and random wipes stay held.
- **College loop:** Arrive → Flint spark → hearth dummy + mentor inks three starters → second cast lesson + three picks → Alder’s leave + three picks. Lessons 6+ open the Primer on the level.
- **Active playtest:** dummy, a consented duel, and the queen on the live host. Combat law: [DS-007](../design-sprints/ds-007-combat-frame.md), [ADR-0035](../adr/0035-party-chorus.md).
- **Local art pass:** `/?builder=1`, `/?rooms=1`, `/?shell=1` (lobby opens first; Enter play, then Lobby in the header).
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** https://greenwood-collegium.onrender.com (no connection strings in this file)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. Story spine (tone, cast, order): [`../content/STORY.md`](../content/STORY.md). Storylines: [`../content/quests/`](../content/quests/README.md)
3. Field Primer, ranks, and every leaf: [`../content/PROGRESSION.md`](../content/PROGRESSION.md)
4. Play and JSON authoring: [`../content/adventures.md`](../content/adventures.md)
5. Implementation handoff: [`CURSOR-HANDOFF-VISUAL-FOUNDATION.md`](CURSOR-HANDOFF-VISUAL-FOUNDATION.md)
6. Slices: DS-001 through DS-007 under [`../design-sprints/`](../design-sprints/). Combat: [`../design-sprints/ds-007-combat-frame.md`](../design-sprints/ds-007-combat-frame.md)
7. Class: [`../classroom/class-day.md`](../classroom/class-day.md), [`playthrough.md`](../../playthrough.md)
8. [`apps/server/AGENTS.md`](../../apps/server/AGENTS.md)

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
