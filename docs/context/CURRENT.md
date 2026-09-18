# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **Release target:** v0.0 foundation (thirty-eight mapped rooms on four floors, look, movement, travel, presence, say, inventory, combat, Ember, Arrival, Schools, level-3 kits)
- **Shipped slices:** DS-001 semantic colour (ADR-0028), visual DS-002–005 play shell / map / plates / lobby, classic DS-002 status, DS-003 command assistance, DS-004 bag, DS-005 quest journal popup, DS-006 minimap, DS-007 Lock-in Chorus combat, party of three and What Still Sleeps. Typed commands stay canonical.
- **Active follow-up:** Classroom play of the queen and consented duels ([ADR-0038](../adr/0038-classroom-duels.md)). The lock-in card now shows the foe plate or classmate look. First-time spawn memory persists. `spells` lists the kit. Year-marks grow health and focus. Investigation quests award a pack item. Do not add Strength. Combat is [DS-007](../design-sprints/ds-007-combat-frame.md) plus [ADR-0035](../adr/0035-party-chorus.md) and [ADR-0037](../adr/0037-first-time-spawns.md).
- **Local art pass:** `/?builder=1`, `/?rooms=1`, `/?shell=1` (lobby opens first; Enter play, then Lobby in the header).
- **Public repo:** https://github.com/thejohnhawkwood/greenwood-collegium
- **Render public hostname:** https://greenwood-collegium.onrender.com (no connection strings in this file)

## Read next

1. Latest entry in [`docs/devlog/`](../devlog/)
2. Implementation handoff: [`CURSOR-HANDOFF-VISUAL-FOUNDATION.md`](CURSOR-HANDOFF-VISUAL-FOUNDATION.md)
3. Slices: DS-001 through DS-007 under [`../design-sprints/`](../design-sprints/). Combat: [`../design-sprints/ds-007-combat-frame.md`](../design-sprints/ds-007-combat-frame.md)
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
