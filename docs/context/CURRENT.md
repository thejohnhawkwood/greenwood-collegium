# Current context

Read this file first on a new machine or in a new Cursor chat. Then open the latest devlog. Do not reread the entire PRD unless the ticket needs a specific section.

## Status

- **HEAD / live:** `5803eaf` on `main` (20 September 2026 pull). CI green. Render deploy success. `/health/ready` ok.
- **Release target:** v0.0 foundation (thirty-eight mapped rooms on four floors, look, movement, travel, presence, say, inventory, combat, Ember, Arrival, Schools, level-3 kits)
- **Shipped on this HEAD:** DS-001–007 play shell and Lock-in Chorus; personal loot and map travel; consented duels ([ADR-0038](../adr/0038-classroom-duels.md)); persisted first-time spawn memory ([ADR-0037](../adr/0037-first-time-spawns.md)); `spells` / `grimoire` lists the kit; year-marks still grow health and focus from XP; investigation quests award a pack item; lock-in card shows foe plates plus overlay FX. Typed commands stay canonical.
- **In the live game, not yet changed:** one orchard dummy; first-lessons still send students to Flint and dump the School kit at year-mark 3; `stats` still shows Level / XP. No Field Primer pages, no hearth dummies, no teacher-lesson rank.
- **Agreed next build (not started):** teacher lessons and a personal Field Primer. Mentors assign a task, students practice on a **hearth** dummy, they talk again, one leaf inks, max health/focus grow. Drop year-mark / silent XP-bar language. Keep Flint’s orchard dummy for weapons, Ember practice, and duels. No Strength. No seasons.
- **Active playtest:** dummy, a consented duel, and the queen on the live host. Combat law: [DS-007](../design-sprints/ds-007-combat-frame.md), [ADR-0035](../adr/0035-party-chorus.md).
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
