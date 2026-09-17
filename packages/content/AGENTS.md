# @greenwood/content

Declarative world data. No React, Fastify, Socket.IO, PostgreSQL, Drizzle, or game rules.

- Ticket 011 owns room JSON, JSON Schema, and validation.
- Ticket 012 owns item templates and placements.
- Ticket 013 owns enemy templates and placements.
- Ticket 014 owns spell templates. Ember is the first spell.
- Ticket 015 owns quest templates. Arrival at the Collegium is the first quest.
- Add a room by adding `rooms/<id>.json`. The file name must match the stable id.
- Add an item by adding `items/<id>.json` and a placement in `placements/`.
- `starterPerCharacter: true` on a placement is a per-Collegian recipe, not one shared instance. The Arrival copper key uses this. The moss-bound primer does not.
- Add an enemy by adding `enemies/<id>.json` and a placement in `enemy-placements/`. Optional `maxFocus` is a real resource (default 6). Optional `minParty` is how many Collegians must stand before the foe squares up. The Silk Queen uses 3. Optional `loot` lists item template ids dropped for first-timers when the spawn dies. Enemies do not spend focus yet. The same spawn can stand again for a Collegian who has not defeated it. A `minParty` boss stands if at least one present Collegian has not.
- Room `map` may include `z`. Grounds omit it (`0`). Unique coordinates are `{x,y,z}`. `up` increases `z`; `down` decreases `z`.
- Add a spell by adding `spells/<id>.json`.
- Add a quest by adding `quests/<id>.json`.
- Do not edit TypeScript to register a room, item, enemy, spell, or quest.
- Invalid content fails `pnpm --filter @greenwood/content validate` and process start.
- Students start in `lantern-court`.
- Character-creation species, reserved names, narrator intro, and species-and-gender appearance text live in `character-creation/`. Do not copy franchise names.
