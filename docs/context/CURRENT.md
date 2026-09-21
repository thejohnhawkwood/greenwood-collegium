# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **HEAD / live:** `67c0fe0` on `main` (21 September 2026 East Watch merge, PR #66). CI green. Render deploy success. `/health/ready` ok. Bundle `index-DQfBwXXC.js`. East Watch rooms return 200 (`/art/rooms/moor-track.png`).
- **Release target:** v0.0 foundation (forty-six mapped rooms, look, movement, travel, presence, say, inventory, combat, Ember, Arrival, Schools, level-3 kits, Field Primer, East Watch)
- **Shipped on this HEAD:** Field Primer ranks 1–5 (ADR-0039). East Watch after Sleeps (eight moor rooms, Wren chain, Fog Walker as a three-Collegian boss). Unique plates: 40 room paintings, Wren + three moor foes, Holm/moor objects. Chroma key is `#EE3173` only.
- **This branch (`east-watch-flavour`):** lock narration on story foes; killable peat-adder; takeable abbey-mark rubbing; kitchens bread-tin memorial. Not live until merged.
- **In the live game, not yet built:** rooms for lessons 11–20. Shop, Strength, type chart, and random wipes stay held.
- **College loop:** Arrive → Flint spark → hearth dummy + mentor inks three starters → second cast lesson + three picks → Alder’s leave + three picks. Lessons 6+ open the Primer on the level.
- **Active playtest:** dummy, a consented duel, and the queen on the live host. Combat law: [DS-007](../design-sprints/ds-007-combat-frame.md), [ADR-0035](../adr/0035-party-chorus.md).
- **Local art pass:** `/?builder=1`, `/?rooms=1`, `/?shell=1` (lobby opens first; Enter play, then Lobby in the header). This branch: peat-adder, abbey-mark rubbing, kitchens tin plates punched on `#EE3173`.
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
