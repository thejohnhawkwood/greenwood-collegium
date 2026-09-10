# Room and quest reference

Developer-facing inventory of the September 10, 2026 content release. The JSON files
linked below remain the source of truth. This pass keeps the existing 25 room IDs,
exits, zones, and map positions, enriches every description, and adds permanent
examinable discoveries. There are six speaking staff NPCs and four quests including
the original Arrival tutorial.

Player instructions and content authoring conventions live in the committed
[play and authoring guide](adventures.md). Design decisions: [ADR-0029](../adr/0029-authored-npc-adventures.md).

## Runtime and persistence

- `packages/content/src/load.ts` discovers JSON files; `validate.ts` verifies references.
- `apps/server/src/application/dev-world.ts` converts validated content to engine state.
- `packages/game-engine/src/talk.ts` resolves a nearby NPC and starts its authored quests.
- `packages/game-engine/src/examine.ts` returns the resolved fixture ID; the gateway
  passes successful examinations to `progressQuests` in `arrival.ts`.
- Quest progress uses stable quest/objective IDs, status, and `rewardGranted`,
  with existing per-character persistence. Changing published IDs needs a progress migration.
- NPC conversations are private and static. Investigation fixtures remain available
  to every player; quests do not consume items or modify the shared room.

## Rooms

Directions below are the actual declared exits, not implied passages in the prose.
All fixtures listed as objects support `examine`/`x`; NPCs support `talk <name>`.
Loose items and the Practice Dummy use their existing placement files.

### Archive Cellar — `archive-cellar`

Cool roots cradle the school's paper memory.

- Source: [room JSON](../../packages/content/rooms/archive-cellar.json).
- Exits: south → `library-stacks`.
- NPCs: none.
- Discoveries: Bell Ledger (`object-bell-ledger`).
- Quest roles: [The Bell Below](#the-bell-below).

### Clock Tower — `clock-tower`

Patient gears count the hours beneath an empty bell frame.

- Source: [room JSON](../../packages/content/rooms/clock-tower.json).
- Exits: west → `north-quad`.
- NPCs: none.
- Discoveries: Empty Bell Frame (`object-empty-bell-frame`).
- Quest roles: [The Bell Below](#the-bell-below).

### Oak Dormitory — `dormitory-oak`

Patchwork quilts and oak beams promise a sturdy night's sleep.

- Source: [room JSON](../../packages/content/rooms/dormitory-oak.json).
- Exits: north → `east-gate`; east → `dormitory-willow`.
- NPCs: none.
- Discoveries: Sock Puppet (`object-sock-puppet`).

### Willow Dormitory — `dormitory-willow`

Willow shadows lace a quiet room of green quilts.

- Source: [room JSON](../../packages/content/rooms/dormitory-willow.json).
- Exits: west → `dormitory-oak`.
- NPCs: none.
- Discoveries: Dream Mobile (`object-dream-mobile`).

### East Gate — `east-gate`

A broad oak gate opens toward a clover-bright meadow.

- Source: [room JSON](../../packages/content/rooms/east-gate.json).
- Exits: west → `lantern-court`; east → `east-meadow`; north → `porter-lodge`; south → `dormitory-oak`.
- NPCs: none.
- Discoveries: Wayboard (`object-wayboard`).

### East Meadow — `east-meadow`

Bees stitch the clover beneath a wide, unhurried sky.

- Source: [room JSON](../../packages/content/rooms/east-meadow.json).
- Exits: west → `east-gate`.
- NPCs: none.
- Discoveries: Bee Skep (`object-bee-skep`).

### Great Hall — `great-hall`

Six bright banners hang above tables built around living oaks.

- Source: [room JSON](../../packages/content/rooms/great-hall.json).
- Exits: south → `lantern-court`; north → `north-quad`; east → `lecture-theatre`; west → `library-stacks`.
- NPCs: Headmaster Alder (`npc-headmaster-alder`).
- Discoveries: School Banners (`object-school-banners`).
- Quest roles: [Arrival at the Collegium](#arrival-at-the-collegium), [The Bell Below](#the-bell-below).

### Greenhouse — `greenhouse`

Warm glass shelters bright seedlings and one unhappy bed.

- Source: [room JSON](../../packages/content/rooms/greenhouse.json).
- Exits: south → `herb-garden`.
- NPCs: none.
- Discoveries: Seedling Tray (`object-seedling-tray`).
- Quest roles: [A Little Room to Grow](#a-little-room-to-grow).

### Herb Garden — `herb-garden`

Fragrant paths wind between neatly labelled beds.

- Source: [room JSON](../../packages/content/rooms/herb-garden.json).
- Exits: east → `south-orchard`; north → `greenhouse`; west → `quiet-chapel`.
- NPCs: Groundskeeper Tansy (`npc-groundskeeper-tansy`).
- Discoveries: Slate Labels (`object-slate-labels`).
- Quest roles: [A Little Room to Grow](#a-little-room-to-grow).

### Infirmary — `infirmary`

Honey-coloured light warms clean beds and folded blankets.

- Source: [room JSON](../../packages/content/rooms/infirmary.json).
- Exits: west → `porter-lodge`.
- NPCs: Healer Fen (`npc-healer-fen`).
- Discoveries: Breathing Wheel (`object-breathing-wheel`).
- Quest roles: [A Little Room to Grow](#a-little-room-to-grow).

### Kitchens — `kitchens`

Copper pans catch the glow of an industrious oven.

- Source: [room JSON](../../packages/content/rooms/kitchens.json).
- Exits: south → `refectory`.
- NPCs: none.
- Discoveries: Recipe Slate (`object-recipe-slate`).

### Lantern Court — `lantern-court`

Blue lanterns drift beneath the welcoming arms of an ancient oak.

- Source: [room JSON](../../packages/content/rooms/lantern-court.json).
- Exits: north → `great-hall`; east → `east-gate`; west → `west-cloister`; south → `south-orchard`.
- NPCs: Porter Bramble (`npc-porter-bramble`).
- Discoveries: Noticeboard (`object-noticeboard`).
- Arrival starts here on join. The small copper key is a personal starter placement; each Collegian can obtain one.

### Lecture Theatre — `lecture-theatre`

Chalk constellations climb above tiers of polished benches.

- Source: [room JSON](../../packages/content/rooms/lecture-theatre.json).
- Exits: west → `great-hall`; north → `refectory`.
- NPCs: none.
- Discoveries: Blackboard (`object-blackboard`).

### Library Stacks — `library-stacks`

Tall shelves shelter the papery hush of a thousand journeys.

- Source: [room JSON](../../packages/content/rooms/library-stacks.json).
- Exits: east → `great-hall`; west → `scriptorium`; north → `archive-cellar`.
- NPCs: Librarian Quill (`npc-librarian-quill`).
- Discoveries: Borrowing Register (`object-borrowing-register`).
- Existing loose item: the moss-bound primer (`item-primer-library-stacks`) remains shared, unlike the Arrival key.
- Quest roles: [The Missing Pages](#the-missing-pages).

### Music Loft — `music-loft`

Strings and sunbeams share a little room above the quad.

- Source: [room JSON](../../packages/content/rooms/music-loft.json).
- Exits: east → `north-quad`.
- NPCs: none.
- Discoveries: Folded Page (`object-folded-page`).
- Quest roles: [The Missing Pages](#the-missing-pages).

### North Quad — `north-quad`

Four paths meet around a sundial that refuses to hurry.

- Source: [room JSON](../../packages/content/rooms/north-quad.json).
- Exits: south → `great-hall`; north → `observatory`; east → `clock-tower`; west → `music-loft`.
- NPCs: none.
- Discoveries: Snail Sundial (`object-snail-sundial`).

### Observatory — `observatory`

Brass instruments wait beneath a roof the colour of old pennies.

- Source: [room JSON](../../packages/content/rooms/observatory.json).
- Exits: south → `north-quad`.
- NPCs: none.
- Discoveries: Star Wheel (`object-star-wheel`).

### Porter Lodge — `porter-lodge`

A ticking kettle keeps company with a regiment of labelled keys.

- Source: [room JSON](../../packages/content/rooms/porter-lodge.json).
- Exits: south → `east-gate`; east → `infirmary`.
- NPCs: none.
- Discoveries: Key Board (`object-key-board`).

### Pottery Shed — `pottery-shed`

Clay freckles the wheels, the benches, and almost everything else.

- Source: [room JSON](../../packages/content/rooms/pottery-shed.json).
- Exits: west → `south-orchard`.
- NPCs: none.
- Discoveries: Watering Jug (`object-watering-jug`).
- Quest roles: [A Little Room to Grow](#a-little-room-to-grow).

### Quiet Chapel — `quiet-chapel`

Rosemary and coloured light fill a small place for stillness.

- Source: [room JSON](../../packages/content/rooms/quiet-chapel.json).
- Exits: east → `herb-garden`.
- NPCs: none.
- Discoveries: Listening Stone (`object-listening-stone`).
- Quest roles: [The Bell Below](#the-bell-below).

### Refectory — `refectory`

Fresh bread perfumes a bright room built for making room.

- Source: [room JSON](../../packages/content/rooms/refectory.json).
- Exits: south → `lecture-theatre`; north → `kitchens`.
- NPCs: none.
- Discoveries: Place Card (`object-place-card`).

### River Landing — `river-landing`

Willow roots hold a little landing above the slow brown river.

- Source: [room JSON](../../packages/content/rooms/river-landing.json).
- Exits: north → `south-orchard`.
- NPCs: none.
- Discoveries: Flood Marker (`object-flood-marker`).

### Scriptorium — `scriptorium`

Ink, lamplight, and careful mistakes inhabit the copying desks.

- Source: [room JSON](../../packages/content/rooms/scriptorium.json).
- Exits: east → `library-stacks`.
- NPCs: none.
- Discoveries: Ink Blotter (`object-ink-blotter`).
- Quest roles: [The Missing Pages](#the-missing-pages).

### South Orchard — `south-orchard`

Low apple boughs shelter a well-used practice clearing.

- Source: [room JSON](../../packages/content/rooms/south-orchard.json).
- Exits: north → `lantern-court`; south → `river-landing`; west → `herb-garden`; east → `pottery-shed`.
- NPCs: Instructor Flint (`npc-instructor-flint`).
- Discoveries: Practice Rules (`object-practice-rules`).
- Existing encounter: Practice Dummy (`enemy-practice-dummy-south-orchard`). Flint explains `attack` and `cast ember`; conversation does not alter combat.

### West Cloister — `west-cloister`

Rain-dark arches frame a walk of moss and old promises.

- Source: [room JSON](../../packages/content/rooms/west-cloister.json).
- Exits: east → `lantern-court`.
- NPCs: none.
- Discoveries: Promise Mosaic (`object-promise-mosaic`).

## Quests

Only Arrival starts automatically. Each new investigation begins by talking to its
giver; clues inspected before acceptance must be examined again. Clues may be
completed in any order, and the final report requires every listed discovery.

<a id="a-little-room-to-grow"></a>

### A Little Room to Grow

- Stable ID: `a-little-room-to-grow`; source: [quest JSON](../../packages/content/quests/a-little-room-to-grow.json).
- Starts: talk to `npc-groundskeeper-tansy` in `herb-garden`.
- Reward: **10 experience**, once per character.

Objectives:

- `inspect-tray` — `examine`: Examine the Seedling Tray in the Greenhouse (north of Herb Garden). Target: fixture `object-seedling-tray` in `greenhouse`.
- `inspect-jug` — `examine`: Examine the Watering Jug in the Pottery Shed (east of South Orchard). Target: fixture `object-watering-jug` in `pottery-shed`.
- `ask-fen` — `talk`: Talk fen in the Infirmary (from Lantern Court: east, north, east). Target: fixture `npc-healer-fen` in `infirmary`.
- `report` — `talk`: After gathering all three observations, talk tansy in Herb Garden. Target: fixture `npc-groundskeeper-tansy` in `herb-garden`. Requires: `inspect-tray`, `inspect-jug`, `ask-fen`.

Resolution: clay from a tool-rinsing jug blocked the seedling tray's drainage. The student gathers observations and Fen's advice; Tansy prepares a careful repair.

<a id="arrival-at-the-collegium"></a>

### Arrival at the Collegium

- Stable ID: `arrival-at-the-collegium`; source: [quest JSON](../../packages/content/quests/arrival-at-the-collegium.json).
- Starts: automatically on joining Lantern Court; the automatic room snapshot does not count as a player-issued look.
- Reward: **10 experience**, once per character.

Objectives:

- `look` — `look`: Look around Lantern Court. Target: the successful player command.
- `speak` — `say`: Say hello so Porter knows you arrived. Target: the successful player command.
- `take` — `take`: Take the small copper key. Target: item template `small-copper-key`.
- `arrive` — `visit`: Walk north to the Great Hall. Target: room `great-hall`.

Resolution: the original tutorial teaches looking, speaking, taking a personal key, and walking north. The first reward advances a new character to level 2.

<a id="the-bell-below"></a>

### The Bell Below

- Stable ID: `the-bell-below`; source: [quest JSON](../../packages/content/quests/the-bell-below.json).
- Starts: talk to `npc-headmaster-alder` in `great-hall`.
- Reward: **15 experience**, once per character.

Objectives:

- `check-frame` — `examine`: Examine the Empty Bell Frame in the Clock Tower (east of North Quad). Target: fixture `object-empty-bell-frame` in `clock-tower`.
- `read-ledger` — `examine`: Examine the Bell Ledger in the Archive Cellar (north of Library Stacks). Target: fixture `object-bell-ledger` in `archive-cellar`.
- `listen` — `examine`: Examine the Listening Stone in the Quiet Chapel (west of Herb Garden). Target: fixture `object-listening-stone` in `quiet-chapel`.
- `report` — `talk`: After all three clues, talk alder in the Great Hall. Target: fixture `npc-headmaster-alder` in `great-hall`. Requires: `check-frame`, `read-ledger`, `listen`.

Resolution: the old bell is absent, but a connected living oak carries its remembered note. The evidence explains the sound's path while leaving the cause of its awakening for later content.

<a id="the-missing-pages"></a>

### The Missing Pages

- Stable ID: `the-missing-pages`; source: [quest JSON](../../packages/content/quests/the-missing-pages.json).
- Starts: talk to `npc-librarian-quill` in `library-stacks`.
- Reward: **10 experience**, once per character.

Objectives:

- `read-blotter` — `examine`: Examine the Ink Blotter in the Scriptorium (west of Library Stacks). Target: fixture `object-ink-blotter` in `scriptorium`.
- `find-page` — `examine`: Examine the Folded Page in the Music Loft (west of North Quad). Target: fixture `object-folded-page` in `music-loft`.
- `report` — `talk`: After both discoveries, talk quill in Library Stacks. Target: fixture `npc-librarian-quill` in `library-stacks`. Requires: `read-blotter`, `find-page`.

Resolution: a page borrowed to study a bird's song ended up steadying a music stand. The student reports where to collect it; Quill prepares a wedge and avoids an unfounded accusation.

## Verification and boundaries

- `packages/content/src/adventures.test.ts` validates the cast, discoveries, quest references, plain text, and dependency constraints.
- `packages/game-engine/src/talk.test.ts` covers name resolution, private narration, reminders, clue gating, and one-time rewards.
- `apps/server/src/application/world-adventures.test.ts` walks all three new quests with 30 interleaved fictional characters.
- `apps/server/src/sockets/adventures.roundtrip.test.ts` checks failed clue requests, private delivery, persistence, reconnect/restart, and replay.

This release does not add rooms, branching dialogue, NPC movement, quest item handover,
healing effects from conversation, or changes to shared fixtures on completion.
