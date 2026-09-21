# @greenwood/content

Declarative world data. No React, Fastify, Socket.IO, PostgreSQL, Drizzle, or game rules.

- Ticket 011 owns room JSON, JSON Schema, and validation.
- Ticket 012 owns item templates and placements.
- Ticket 013 owns enemy templates and placements.
- Ticket 014 owns spell templates. Ember is the first spell. Each School has seven leaves. Optional `tag`, `pennedBy`, and `ranks` describe Primer pages. Presentation keys stay cosmetic. The developer catalog is `docs/content/PROGRESSION.md`.
- Ticket 015 owns quest templates. Arrival at the Collegium is the first quest. First/second/third-lessons are the college loop. `defeat` and `cast` objectives are legal. Optional `requiresQuestIds` must already be complete before a giver can start the quest. Story spine: `docs/content/STORY.md`. Storylines: `docs/content/quests/`. Play/author: `docs/content/adventures.md`.
- Add a room by adding `rooms/<id>.json`. The file name must match the stable id.
- Add an item by adding `items/<id>.json` and a placement in `placements/`.
- `starterPerCharacter: true` on a placement is a per-Collegian recipe, not one shared instance. The Arrival copper key, the personal Field Primer, and the abbey-mark rubbing at the standing stones use this. The moss-bound primer does not.
- Add an enemy by adding `enemies/<id>.json` and a placement in `enemy-placements/`. Optional `maxFocus` is a real resource (default 6). Optional `minParty` is how many Collegians must stand before the foe squares up. The Silk Queen and Fog Walker use 3. Optional `loot` lists item template ids dropped for first-timers when the spawn dies. Optional `victoryNarration` replaces “the lesson is over” on a win. Optional `lockNarration` is spoken on later `combat.turn_started` rounds (`round > 1`). The dummy stays quiet. Enemies do not spend focus yet. The same spawn can stand again for a Collegian who has not defeated it. A `minParty` boss stands if at least one present Collegian has not.
- Room `map` may include `z`. Grounds omit it (`0`). Unique coordinates are `{x,y,z}`. `up` increases `z`; `down` decreases `z`.
- Add a spell by adding `spells/<id>.json`.
- Add a quest by adding `quests/<id>.json`. Add the matching storyline under `docs/content/quests/` and a row in that folder's README plus the spine graph in `docs/content/STORY.md`.
- Do not edit TypeScript to register a room, item, enemy, spell, or quest.
- Invalid content fails `pnpm --filter @greenwood/content validate` and process start.
- Students start in `lantern-court`.
- Character-creation species, reserved names, narrator intro, and species-and-gender appearance text live in `character-creation/`. Do not copy franchise names.
