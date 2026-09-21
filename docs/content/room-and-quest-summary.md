# Room and quest reference

Developer-facing inventory of the September 10, 2026 content release. The JSON files
linked below remain the source of truth. This pass keeps the campus rooms, the
High Study, the Hall of Schools, six hearths, and the Bell Stair below
the Clock Tower. There are thirteen speaking staff NPCs and twelve quests
including Arrival and the six first-lessons. Floors use map `z` (ADR-0036).

Index of content bibles: [README.md](README.md).
Player instructions and JSON authoring: [adventures.md](adventures.md).
Story spine: [STORY.md](STORY.md). Storylines: [quests/](quests/README.md).
Field Primer: [PROGRESSION.md](PROGRESSION.md).
Design decisions: [ADR-0029](../adr/0029-authored-npc-adventures.md).

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
- Exits: west → `north-quad`; down → `bell-stair`.
- NPCs: none.
- Discoveries: Empty Bell Frame (`object-empty-bell-frame`).
- Quest roles: [The Bell Below](#the-bell-below). [The Bell Wakes](#the-bell-wakes).

### Bell Stair — `bell-stair`

A tight oak stair turns below the empty frame.

- Source: [room JSON](../../packages/content/rooms/bell-stair.json).
- Map `{x: 1, y: 2, z: -1}`. `visualState`: `clock-tower`. Exits: up → `clock-tower`; down → `silk-gallery`.
- NPCs: none.
- Discoveries: Stair Rope (`object-stair-rope`).
- Quest roles: [The Bell Wakes](#the-bell-wakes).

### Silk Gallery — `silk-gallery`

Pale galleries of silk keep the old stone polite.

- Source: [room JSON](../../packages/content/rooms/silk-gallery.json).
- Map `{x: 1, y: 2, z: -2}`. `visualState`: `clock-tower`. Exits: up → `bell-stair`; east → `webbed-cloister`.
- NPCs: Piper Mole (`npc-piper-mole`).
- Discoveries: Silk Thread (`object-silk-thread`).
- Quest roles: [The Bell Wakes](#the-bell-wakes).

### Webbed Cloister — `webbed-cloister`

An old walk has been lent to silk and patience.

- Source: [room JSON](../../packages/content/rooms/webbed-cloister.json).
- Map `{x: 2, y: 2, z: -2}`. `visualState`: `clock-tower`. Exits: west → `silk-gallery`; south → `cocoon-nave`.
- NPCs: none.
- Discoveries: Caught Lantern (`object-caught-lantern`).
- Quest roles: path to the nave.

### Cocoon Nave — `cocoon-nave`

A nave of husks keeps one early waking.

- Source: [room JSON](../../packages/content/rooms/cocoon-nave.json).
- Map `{x: 2, y: 1, z: -2}`. `visualState`: `clock-tower`. Exits: north → `webbed-cloister`; south → `deep-cradle`.
- NPCs: none. Enemy: Silk Hatchling (`enemy-silk-hatchling-cocoon-nave`).
- Discoveries: Waking Husk (`object-waking-husk`); Keeper's Wrapping (`object-holm-wrapping`).
- Quest roles: [The Bell Wakes](#the-bell-wakes). [What Still Sleeps](#what-still-sleeps).

### Deep Cradle — `deep-cradle`

A still chamber keeps what the nave would not yet name.

- Source: [room JSON](../../packages/content/rooms/deep-cradle.json).
- Map `{x: 2, y: 0, z: -2}`. `visualState`: `clock-tower`. Exit: north → `cocoon-nave`.
- NPCs: none. Enemy: Silk Queen (`enemy-silk-queen-deep-cradle`, `minParty`: 3).
- Discoveries: Still Score (`object-still-score`).
- Quest roles: [What Still Sleeps](#what-still-sleeps).

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
- Exits: west → `east-gate`; east → `hall-of-schools`; north → `moor-track`.
- NPCs: none.
- Discoveries: Bee Skep (`object-bee-skep`).
- Quest roles: [The East Watch](#the-east-watch). The hedge-path north bends east onto the moor. That road is not the Infirmary.

### Moor Track — `moor-track`

A wet track leaves the clover and turns toward peat and wool.

- Source: [room JSON](../../packages/content/rooms/moor-track.json).
- Map `{x: 6, y: 1}`. Unique plate `moor-track.png`. Exits: south → `east-meadow`; north → `wren-croft`; east → `sheepfold`.
- NPCs: none.
- Discoveries: Waystone (`object-waystone`).
- Quest roles: [The East Watch](#the-east-watch).

### Wren's Croft — `wren-croft`

A peat fire, a kettle, and one empty peg.

- Source: [room JSON](../../packages/content/rooms/wren-croft.json).
- Map `{x: 6, y: 2}`. Unique plate `wren-croft.png`. Exit: south → `moor-track`.
- NPCs: Shepherd Wren (`npc-shepherd-wren`).
- Discoveries: Empty Peg (`object-empty-peg`).
- Quest roles: [The East Watch](#the-east-watch).

### Sheepfold — `sheepfold`

A wet fold whose latch was lifted, not broken.

- Source: [room JSON](../../packages/content/rooms/sheepfold.json).
- Map `{x: 7, y: 1}`. Unique plate `sheepfold.png`. Exits: west → `moor-track`; east → `standing-stones`.
- NPCs: none. Enemy: Mist Crow (`enemy-mist-crow-sheepfold`).
- Discoveries: Empty Fold (`object-empty-fold`); Colm's Crook (`object-colms-crook`).
- Quest roles: [The East Watch](#the-east-watch).

### Standing Stones — `standing-stones`

Seven old stones and one that has not had a year.

- Source: [room JSON](../../packages/content/rooms/standing-stones.json).
- Map `{x: 8, y: 1}`. Unique plate `standing-stones.png`. Exits: west → `sheepfold`; north → `peat-cut`.
- Discoveries: Abbey Mark (`object-abbey-mark`); New Stone (`object-new-stone`). Personal takeable: Abbey Mark Rubbing (`abbey-mark-rubbing`, starter per Collegian).
- Quest roles: [The East Watch](#the-east-watch).

### Peat Cut — `peat-cut`

Black water, old tea and iron, fog at knee height.

- Source: [room JSON](../../packages/content/rooms/peat-cut.json).
- Map `{x: 8, y: 2}`. Unique plate `peat-cut.png`. Exits: south → `standing-stones`; north → `barrow-mouth`.
- Discoveries: Peat Water (`object-peat-water`); Shed Skin (`object-shed-skin`).
- Enemy: Peat Adder (`enemy-peat-adder-peat-cut`). Solo, optional, not a quest objective.
- Quest roles: path to the barrow.

### Barrow Mouth — `barrow-mouth`

A hill-lip of wet wool, peat, and one folded cloak.

- Source: [room JSON](../../packages/content/rooms/barrow-mouth.json).
- Map `{x: 8, y: 3}`. Unique plate `barrow-mouth.png`. Exits: south → `peat-cut`; down → `barrow-nave`.
- NPCs: none. Enemy: Barrow Guard (`enemy-barrow-guard-barrow-mouth`). Colm is a fixture, not a talk target.
- Discoveries: Spare Cloak (`object-wool-wrap`); Colm (`object-colm-aftermath`).
- Quest roles: [The East Watch](#the-east-watch).

### Barrow Nave — `barrow-nave`

The hill's inside, peat-stained bronze, three slow pulses.

- Source: [room JSON](../../packages/content/rooms/barrow-nave.json).
- Map `{x: 8, y: 3, z: -1}`. Unique plate `barrow-nave.png`. Exits: up → `barrow-mouth`; north → `fog-hollow`.
- Discoveries: Abbey Bronze (`object-abbey-bronze`).
- Quest roles: [The East Watch](#the-east-watch).

### Fog Hollow — `fog-hollow`

A bowl of fog that does not keep footprints.

- Source: [room JSON](../../packages/content/rooms/fog-hollow.json).
- Map `{x: 8, y: 4, z: -1}`. Unique plate `fog-hollow.png`. Exit: south → `barrow-nave`.
- NPCs: none. Enemy: Fog Walker (`enemy-fog-walker-fog-hollow`, `minParty`: 3).
- Discoveries: No Footprints (`object-no-footprints`).
- Quest roles: [The East Watch](#the-east-watch).

### Great Hall — `great-hall`

Six bright banners hang above tables built around living oaks.

- Source: [room JSON](../../packages/content/rooms/great-hall.json).
- Exits: south → `lantern-court`; north → `north-quad`; east → `lecture-theatre`; west → `library-stacks`; up → `headmaster-study`.
- NPCs: none. Alder waits in the High Study.
- Discoveries: School Banners (`object-school-banners`).
- Quest roles: [Arrival at the Collegium](#arrival-at-the-collegium).

### The High Study — `headmaster-study`

A high oak study above the Great Hall, kept for hard questions.

- Source: [room JSON](../../packages/content/rooms/headmaster-study.json).
- Map `{x: 0, y: 1, z: 1}`. Forced landing after Arrival. Exit: down → `great-hall`.
- NPCs: Headmaster Alder (`npc-headmaster-alder`), recast as an old fierce snowy owl.
- Discoveries: School Chart (`object-school-chart`).
- Quest roles: school selection. [The Bell Below](#the-bell-below) starts here after first lessons. [The Bell Wakes](#the-bell-wakes) starts here after that report. [What Still Sleeps](#what-still-sleeps) starts here after that report. After the queen and Alder’s Leave, Alder offers the East Watch, then the bronze, then the walker.

### Hall of Schools — `hall-of-schools`

Six banners wait above a stone hall that has only just opened east of the meadow.

- Source: [room JSON](../../packages/content/rooms/hall-of-schools.json).
- Exits: west → `east-meadow`; north → `hearth-steel`; south → `hearth-stone`; east → `hearth-ember`.
- NPCs: none.
- Discoveries: School Banners (`object-hall-banners`).

### Hearth of Ember — `hearth-ember`

Banked coals keep a copper grate honest.

- Source: [room JSON](../../packages/content/rooms/hearth-ember.json).
- Exits: west → `hall-of-schools`; north → `hearth-thorn`; south → `hearth-veil`.
- NPCs: Mentor Cinder (`npc-mentor-cinder`).
- Discoveries: Copper Grate (`object-ember-grate`).
- Quest roles: [First Lessons: Ember](#first-lessons).

### Hearth of Stars — `hearth-stars`

Night windows keep company with ink-stained charts.

- Source: [room JSON](../../packages/content/rooms/hearth-stars.json).
- Exits: south → `hearth-thorn`.
- NPCs: Mentor Lumen (`npc-mentor-lumen`).
- Discoveries: Star Wheel (`object-stars-wheel`).
- Quest roles: [First Lessons: Stars](#first-lessons).

### Hearth of Steel — `hearth-steel`

Anvils and hanging mail keep the room honest.

- Source: [room JSON](../../packages/content/rooms/hearth-steel.json).
- Exits: south → `hall-of-schools`; east → `hearth-thorn`.
- NPCs: Mentor Edge (`npc-mentor-edge`).
- Discoveries: Practice Anvil (`object-steel-anvil`).
- Quest roles: [First Lessons: Steel](#first-lessons).

### Hearth of Stone — `hearth-stone`

Granite takes the weight and does not complain.

- Source: [room JSON](../../packages/content/rooms/hearth-stone.json).
- Exits: north → `hall-of-schools`; east → `hearth-veil`.
- NPCs: Mentor Quern (`npc-mentor-quern`).
- Discoveries: Carved Keystone (`object-stone-keystone`).
- Quest roles: [First Lessons: Stone](#first-lessons).

### Hearth of Thorns — `hearth-thorn`

Living briar holds the glass and the light.

- Source: [room JSON](../../packages/content/rooms/hearth-thorn.json).
- Exits: south → `hearth-ember`; west → `hearth-steel`; north → `hearth-stars`.
- NPCs: Mentor Briar (`npc-mentor-briar`).
- Discoveries: Briar Trellis (`object-thorn-trellis`).
- Quest roles: [First Lessons: Thorns](#first-lessons).

### Hearth of the Veil — `hearth-veil`

Silver curtains keep half the room in honest shadow.

- Source: [room JSON](../../packages/content/rooms/hearth-veil.json).
- Exits: north → `hearth-ember`; west → `hearth-stone`.
- NPCs: Mentor Mist (`npc-mentor-mist`).
- Discoveries: Dark Mirror (`object-veil-mirror`).
- Quest roles: [First Lessons: the Veil](#first-lessons).

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
- Discoveries: Recipe Slate (`object-recipe-slate`); Bread Tin (`object-kitchen-initials`, Holm and Colm initials).

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

Story spine: [STORY.md](STORY.md). Storylines: [quests/](quests/README.md). This
section is the live ID inventory.

Only Arrival starts automatically. Each new investigation begins by talking to its
giver; clues inspected before acceptance must be examined again. Clues may be
completed in any order, and the final report requires every listed discovery.

<a id="a-little-room-to-grow"></a>

### A Little Room to Grow

- Story: [a-little-room-to-grow.md](quests/a-little-room-to-grow.md).
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

- Story: [arrival.md](quests/arrival.md).
- Stable ID: `arrival-at-the-collegium`; source: [quest JSON](../../packages/content/quests/arrival-at-the-collegium.json).
- Starts: automatically on joining Lantern Court; the automatic room snapshot does not count as a player-issued look.
- Reward: **10 experience**, once per character.

Objectives:

- `look` — `look`: Look around Lantern Court. Target: the successful player command.
- `speak` — `say`: Say hello so Porter knows you arrived. Target: the successful player command.
- `take` — `take`: Take the small copper key. Target: item template `small-copper-key`.
- `arrive` — `visit`: Walk north to the Great Hall. Target: room `great-hall`.

Resolution: the original tutorial teaches looking, speaking, taking a personal key, and walking north. The first reward advances a new character to level 2. Completion summons the Collegian to the High Study.

<a id="first-lessons"></a>

### First Lessons

- Story: [college-lessons.md](quests/college-lessons.md) (first, second, and Alder’s Leave).
- Stable IDs: `first-lessons-ember`, `first-lessons-thorn`, `first-lessons-veil`, `first-lessons-stars`, `first-lessons-stone`, `first-lessons-steel`.
- Starts: automatically when Alder’s School choice teleports the Collegian to that hearth.
- Reward: **15 experience**, once per character. Inks all three starter leaves at rank 1.

Objectives:

- `look-hearth` — `look` in the chosen hearth.
- `defeat-dummy` — `defeat` the hearth dummy in that hearth.
- `report` — `talk` the School mentor.

Resolution: the student looks the hearth, defeats the hearth dummy, and reports back. The Primer inks three starter leaves. Second and third lessons follow (`second-lessons-*`, `third-lessons-*`).

<a id="the-bell-below"></a>

### The Bell Below

- Story: [the-bell-below.md](quests/the-bell-below.md).
- Stable ID: `the-bell-below`; source: [quest JSON](../../packages/content/quests/the-bell-below.json).
- Starts: talk Alder in the High Study after that School's first-lessons quest is complete.
- Reward: **15 experience**, once per character.

Objectives:

- `check-frame` — `examine`: Examine the Empty Bell Frame in the Clock Tower (east of North Quad). Target: fixture `object-empty-bell-frame` in `clock-tower`.
- `read-ledger` — `examine`: Examine the Bell Ledger in the Archive Cellar (north of Library Stacks). Target: fixture `object-bell-ledger` in `archive-cellar`.
- `listen` — `examine`: Examine the Listening Stone in the Quiet Chapel (west of Herb Garden). Target: fixture `object-listening-stone` in `quiet-chapel`.
- `report` — `talk`: After all three clues, talk alder in the High Study. Target: fixture `npc-headmaster-alder` in `headmaster-study`. Requires: `check-frame`, `read-ledger`, `listen`.

Resolution: the old bell is absent, but a connected living oak carries its remembered note. The evidence explains the sound's path while leaving the cause of its awakening for later content.

<a id="the-bell-wakes"></a>

### The Bell Wakes

- Story: [the-bell-wakes.md](quests/the-bell-wakes.md).
- Stable ID: `the-bell-wakes`; source: [quest JSON](../../packages/content/quests/the-bell-wakes.json).
- Starts: talk Alder in the High Study after The Bell Below is complete.
- Reward: **15 experience**, once per character.

Objectives:

- `check-rope` — `examine`: Examine the Stair Rope on the Bell Stair. Target: fixture `object-stair-rope` in `bell-stair`.
- `hear-piper` — `talk`: Talk piper in the Silk Gallery. Target: fixture `npc-piper-mole` in `silk-gallery`.
- `check-thread` — `examine`: Examine the Silk Thread in the Silk Gallery. Target: fixture `object-silk-thread` in `silk-gallery`.
- `check-husk` — `examine`: Examine the Waking Husk in the Cocoon Nave. Target: fixture `object-waking-husk` in `cocoon-nave`.
- `report` — `talk`: After the stair, Piper, thread, and husk, talk alder in the High Study. Target: fixture `npc-headmaster-alder` in `headmaster-study`. Requires: `check-rope`, `hear-piper`, `check-thread`, `check-husk`.

Resolution: a hatchling woke before the score allows. The silk is a cradle, not a throne. Alder then offers What Still Sleeps.

<a id="what-still-sleeps"></a>

### What Still Sleeps

- Story: [what-still-sleeps.md](quests/what-still-sleeps.md) (canon: Holm, queen defeat).
- Stable ID: `what-still-sleeps`; source: [quest JSON](../../packages/content/quests/what-still-sleeps.json).
- Starts: talk Alder in the High Study after The Bell Wakes is complete.
- Reward: **20 experience**, once per character.

Objectives:

- `read-wrapping` — `examine`: Examine the Keeper's Wrapping in the Cocoon Nave. Target: fixture `object-holm-wrapping`.
- `stand-together` — `visit`: Go to the Deep Cradle with classmates. South from the Cocoon Nave. Room: `deep-cradle`.
- `read-score` — `examine`: Examine the Still Score in the Deep Cradle. Target: fixture `object-still-score` in `deep-cradle`.
- `defeat-queen` — `defeat`: Defeat the Silk Queen with two classmates. Target: spawn `enemy-silk-queen-deep-cradle`.
- `report` — `talk`: After wrapping, cradle, score, and queen, talk alder in the High Study. Target: fixture `npc-headmaster-alder`. Requires: `read-wrapping`, `stand-together`, `read-score`, `defeat-queen`.

Resolution: Holm is named. The queen folds. Eat something warm. Alder then offers the East Watch after third lessons.

<a id="the-east-watch"></a>

### The East Watch

- Story: [the-east-watch.md](quests/the-east-watch.md).
- Stable IDs: `the-meadow-fork`, `the-uncounted-flock`, `the-stones-that-were-not-there`, `the-barrow-mouth`, `what-the-fog-took`, `the-bronze-in-the-hill`, `the-thing-that-walks`.
- Starts: `north` from `east-meadow` after What Still Sleeps and Alder’s Leave. Wren is giver for L4–L7. Alder offers L9–L10.
- Map column starts at `{x: 6, y: 1}`. `moor-track` south returns to the meadow.
- Sources: [the-meadow-fork.json](../../packages/content/quests/the-meadow-fork.json) through [the-thing-that-walks.json](../../packages/content/quests/the-thing-that-walks.json).
- Rewards: 25 / 25 / 30 / 35 / 40 / 50 / 60 experience. Personal wool and hearth charms on flock and walker.

Resolution: Colm is named and left covered. Wren stays at the kettle. The bronze is in the hill. Who carried it remains open.

<a id="the-missing-pages"></a>

### The Missing Pages

- Story: [the-missing-pages.md](quests/the-missing-pages.md).
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

The Bell Stair rooms and the Deep Cradle are charted on their own floors and reuse Clock Tower art.
East Watch outdoors reuse East Meadow art; Wren's Croft reuses Porter Lodge; barrow interiors reuse Archive Cellar.
The Silk Queen and Fog Walker require three Collegians (`minParty`: 3). Dummy, hatchling, mist-crow, and barrow-guard stay solo.
A spawn stays available for a first-time Collegian. A party boss stands if at least one present Collegian has not fought it. First-timers receive experience and authored loot.
