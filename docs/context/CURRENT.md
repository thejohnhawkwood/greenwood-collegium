# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **This revision:** Opening narrative on join. East side after the meadow fork (eight rooms, Hobb, Sile, Kern). South river hub (thirteen rooms counting the landing, Marram, Nett, Midge, a solo river captain). 66 rooms, 40 quests. Every quest has an item reward. Every foe has loot. Confirm `/health/ready` after Render finishes the merge.
- **Release target:** v0.0 foundation (sixty-six mapped rooms, look, movement, travel, presence, say, inventory, combat, Ember, Arrival, Schools, level-3 kits, Field Primer, East Watch, river hub)
- **Shipped on this HEAD:** Field Primer ranks 1–5 (ADR-0039). East Watch after Sleeps, plus the east side and the river hub. Lock narration on later combat rounds. Killable peat-adder. Personal abbey-mark rubbing. Kitchens bread-tin memorial. New east and river places still borrow existing room plates. Their own plates are not drawn. Art task: [`../art/HANDOFF-EAST-RIVER-PLATES.md`](../art/HANDOFF-EAST-RIVER-PLATES.md). Chroma key is `#EE3173` only.
- **In the live game, not yet built:** rooms for lessons 11–20. Shop, Strength, type chart, and random wipes stay held.
- **College loop:** Arrive → Flint spark → hearth dummy + mentor inks the School stem → second cast lesson grants ink → Alder’s leave grants ink. Lessons 6–20 grant one ink each. Spend it on a legal Primer vein.
- **Active playtest:** dummy, a consented duel, and the queen on the live host. Combat law: [DS-007](../design-sprints/ds-007-combat-frame.md), [ADR-0035](../adr/0035-party-chorus.md).
- **Local art pass:** `/?builder=1`, `/?rooms=1`, `/?shell=1` (lobby opens first; Enter play, then Lobby in the header). Live plates include peat-adder, abbey-mark rubbing, and kitchens tin, punched on `#EE3173`.
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** https://greenwood-collegium.onrender.com (no connection strings in this file)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. Story spine (tone, cast, order): [`../content/STORY.md`](../content/STORY.md). Storylines: [`../content/quests/`](../content/quests/README.md). Prose standard and audit: [`../narrative/`](../narrative/README.md)
3. Field Primer, ranks, and every leaf: [`../content/PROGRESSION.md`](../content/PROGRESSION.md)
4. Play and JSON authoring: [`../content/adventures.md`](../content/adventures.md)
5. Implementation handoff: [`CURSOR-HANDOFF-VISUAL-FOUNDATION.md`](CURSOR-HANDOFF-VISUAL-FOUNDATION.md)
6. Slices: DS-001 through DS-007 under [`../design-sprints/`](../design-sprints/). Combat: [`../design-sprints/ds-007-combat-frame.md`](../design-sprints/ds-007-combat-frame.md)
7. Class: [`../classroom/class-day.md`](../classroom/class-day.md), [`playthrough.md`](../../playthrough.md)
8. [`apps/server/AGENTS.md`](../../apps/server/AGENTS.md)
9. Drawing-led art (new pictures only; production plates stay until a named revision is approved): [`../../GREENWOOD_ART_DIRECTION.md`](../../GREENWOOD_ART_DIRECTION.md), [ADR-0041](../adr/0041-drawing-led-art.md), [`../art/START_HERE.md`](../art/START_HERE.md)

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
