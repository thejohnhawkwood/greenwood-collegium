# The East Watch

- **Series:** spine (lessons 4–10, outside college)
- **Status:** live
- **Stable ids:** `the-meadow-fork`, `the-uncounted-flock`, `the-stones-that-were-not-there`, `the-barrow-mouth`, `what-the-fog-took`, `the-bronze-in-the-hill`, `the-thing-that-walks`
- **Spine:** [STORY.md](../STORY.md)
- **Starts after:** [What Still Sleeps](what-still-sleeps.md) and Alder’s Leave in [college lessons](college-lessons.md)
- **Play / author:** [adventures.md](../adventures.md)

Mist, wet wool, lost shepherds, standing stones, a barrow, a thing that walks the fog. **Not another silk dungeon.** The queen and the fog-walker are two hungers from one old wound: the bronze taken on Holm’s wet night.

Hub: **Shepherd Wren** (hare, adult). Lives. Kettle, wet cloaks, oatcakes. Afraid, not cute.

Named loss: **Colm** (adult shepherd). Same grim ceiling as Holm. Students never `talk colm`. Wren lives.

Prefer Wren as `giverNpcId` so Alder is not a commute every beat. L10 reports to Alder.

Intended entry: lesson 4 or 5 after the queen report. Over-levelled students still play the story. Do not engine-gate rooms by level until that exists. XP below is quest reward; combat XP is extra. Primer table: [STORY.md](../STORY.md) §6.1.

## Door and map

**Fiction:** Hall of Schools stays **east** of East Meadow (class). The moor road leaves along the **north hedge**. Students type `north` from `east-meadow`.

**Map collision:** `{x: 3, y: 1}` is the Infirmary. Unique coords are `{x,y,z}`. Do not put `moor-track` on that tile.

**Placement:** new column east of the hearths, `x: 6` and up, `z: 0`. East Meadow look text must say the north hedge-path *bends east onto the moor*. East-gate wayboard: NORTH-OF-MEADOW: moor road, Wren’s croft.

**River Landing** stays a future otter series. Do not connect 4–10 through the south orchard.

## Arrowhead

### L4 — The Meadow Fork (`the-meadow-fork`)

- **XP:** 25 plus `moor-boots`
- **Giver:** Alder breadcrumb after Sleeps, then Wren
- **Rooms:** `east-meadow`, `moor-track`, `wren-croft`
- **Objectives:** visit `moor-track`; talk Wren; examine `object-waystone`; talk Wren
- **Mobs:** none
- **Alder:** “North from the East Meadow. The Hall stays east for class. Talk to Shepherd Wren. She has a croft and a missing partner. Do not invent a second queen on the way.”
- **Wren:** kettle on; Colm has not come in; the flock was due at dusk yesterday; sit; eat.
- **Waystone:** abbey mark south, sheep-scratch north, three chalked circles (chapel count).
- **Next command:** from East Meadow, `north`, `talk wren`, `examine waystone`.
- **Cozy:** oatcakes. Grim seed: empty peg where Colm’s crook should hang.

### L5 — The Uncounted Flock (`the-uncounted-flock`)

- **XP:** 25 plus mist-crow combat
- **Giver:** Wren
- **Rooms:** `wren-croft`, `sheepfold`
- **Objectives:** visit `sheepfold`; examine `object-empty-fold`; examine `object-colms-crook`; defeat `enemy-mist-crow-sheepfold`; talk Wren
- **Mob:** Mist Crow — wet black bird too large for a rook, fog in the feathers. Solo. HP ~12, atk 3, XP 10.
- **Fold:** hoof-marks out, not in. Latch lifted, not broken. No blood.
- **Crook:** ash wood, Colm’s knife-marks. Set down carefully. Prefer the crook as a **shared fixture**; personal reward `wren-wool-charm`.
- **Wren on return:** tea too hot. “The stones next. They were not in last winter’s count. Colm went to look. I told him not to.”

### L6 — The Stones That Were Not There (`the-stones-that-were-not-there`)

- **XP:** 30 plus `abbey-mark-ring` (the rubbing stays a bag proof)
- **Giver:** Wren
- **Rooms:** `standing-stones`
- **Objectives:** visit; examine `object-abbey-mark`; examine `object-new-stone`; talk Wren
- **Mobs:** none required. Optional peat-adder (`enemy-peat-adder-peat-cut`) on the cut; solo, killable, not a quest objective.
- **Stars / Stone** feel useful in copy. All schools can finish. No school gate.
- **Abbey mark:** Collegium mason’s sign, old, three circles.
- **New stone:** lichen has not had a year. Wet when the others are only damp. Hums the chapel count.
- **Wren:** “Last winter there were seven. There are eight.”

### L7 — The Barrow Mouth (`the-barrow-mouth`)

- **XP:** 35 plus guard, plus `peat-lantern` (off hand; not Colm’s crook)
- **Giver:** Wren, who hates sending you
- **Rooms:** `peat-cut`, `barrow-mouth`
- **Objectives:** visit `barrow-mouth`; examine `object-wool-wrap`; defeat `enemy-barrow-guard-barrow-mouth`; talk Wren
- **Mob:** Barrow Guard — peat-and-bone that is not a dog. Solo. HP ~18, atk 4, XP 15.
- **Wool wrap (not Colm):** prefer **Colm’s spare cloak**, folded on a stone like an offering. Wet wool, not silk. Enough to scare. Not the body.
- **Peat-cut:** black water, old tea and iron, fog at knee height.
- **Wren:** “If you find him, you come to me before you go to Alder. I am owed that.”

### L8 — What the Fog Took (`what-the-fog-took`)

- **XP:** 40 plus `fog-glass-bead`
- **Giver:** Wren; then talk **Fen** (warm food, do not skip Wren’s grief)
- **Rooms:** barrow-mouth or barrow-nave threshold
- **Objectives:** examine `object-colm-aftermath`; talk Wren; talk Fen

**Colm aftermath (ceiling, Holm rhyme on open ground):**

Colm is under the barrow lip, sitting as if he sat down out of the wind. Fog has soaked his wool coat through. His crook-hand is empty (you already found the crook). There is no silk. There is a stillness that shepherds use for sheep that will not rise. His eyes are closed. The fog moves and he does not. Leave him covered with his own cloak if the spare is here. Tell Wren. Do not invent a fight you already missed.

No wounds. No eating. He is past air. The fog-walker kept him the way weather keeps a stone.

**Wren:** she breaks. Kettle down too hard. She asks if you told him anything, then hates the question. Go to Fen.

**Fen:** sit. Honey. He asks if you can feel your paws.

Two hungers. Two keepers. Two witnesses who lived (Piper, Wren).

### L9 — The Bronze in the Hill (`the-bronze-in-the-hill`)

- **XP:** 50 plus `patched-hood` (wool and stitch, not the bronze)
- **Giver:** Alder (Wren will not go in)
- **Rooms:** `barrow-nave`
- **Objectives:** visit; examine `object-abbey-bronze`; talk Alder
- **The bell:** Collegium bronze, or yoke and clapper if the full bell is too large. It should not ring. It sounds the three slow pulses. The Quiet Chapel was telling the truth.
- **Examine:** green with peat-stain. Half-sunk as if the hill grew around it. Holm wrote that it was taken on a wet night. This is where it was taken *to*.
- **Alder:** “One more. Not alone. The thing that walks the fog used our welcome for a mouth.”

### L10 — The Thing That Walks (`the-thing-that-walks`)

- **XP:** 60 plus boss combat. Bump if playtests undershoot 320 cumulative.
- **Giver:** Alder; Wren blesses you and stays at the croft
- **Rooms:** `fog-hollow`
- **Objectives:** visit; defeat `enemy-fog-walker-fog-hollow`; talk Alder
- **Boss:** Fog Walker. `minParty: 3`. HP ~32, atk 6, focus 12, XP 25. Personal loot `wren-hearth-charm`.
- **Look:** a tall wet shape that does not keep footprints. Wool and peat. Not a deer-god lecture. A hunger that learned to walk.
- **Combat:** fog thickens on lock-in; three-count; when it falls the hollow smells like rain on a hearth-stone, **not** sweetness.
- **Alder:** the wood and the moor both remember. Eat. Sleep. Open mystery: *who took the bronze into the hill, if the walker only learned to use it?* Do not answer here.

**Next command:** three Collegians, lock, `talk alder`, food.

## Side chain (never required, after the waystone)

Does not spoil Colm. Does not gate L5–L10.

- **The Empty Byre** (`the-empty-byre`) — Hobb, after `the-meadow-fork`. Byre, fold-hound, fold mitts.
- **The Mere That Keeps** (`the-mere-that-keeps`) — Sile. Still water, reed-wisp, reed cloak.
- **The Ninth Scratch** (`the-ninth-scratch`) — Kern. Scratch stone, ditch-lurker, lintel band.
- **One Page For Three** (`one-page-for-three`) — Kern, after the scratch. Talk Hobb for the night of the bell, Sile for the night of the voice, then Kern. He writes all three under one date, they are the same three nights, and he tears the page out. Reward: the fold tally page. It closes the side chain and still gates nothing.

Rooms: `wool-shed`, `croft-byre`, `mist-lane`, `reed-mere`, `lintel-field`, `salt-grass`, `black-ditch`, `crow-stile`.

## Side colour (never required)

Live talk colour, not quests: Tansy peat-mint after the stones; Quill will keep a rubbing; Flint says lock together, then Fen.

## Live map

| id | title | map (z 0 unless noted) | exits (story) |
| --- | --- | --- | --- |
| `moor-track` | Moor Track | 6,1 | south → east-meadow (player typed north to enter); north → wren-croft; east → sheepfold |
| `wren-croft` | Wren’s Croft | 6,2 | south → moor-track; north → croft-byre; east → wool-shed |
| `wool-shed` | Wool Shed | 7,2 | south → sheepfold; west → wren-croft; north → mist-lane |
| `croft-byre` | Croft Byre | 6,3 | south → wren-croft; east → mist-lane |
| `mist-lane` | Mist Lane | 7,3 | south → wool-shed; west → croft-byre; north → reed-mere |
| `reed-mere` | Reed Mere | 7,4 | south → mist-lane |
| `sheepfold` | Sheepfold | 7,1 | west → moor-track; east → standing-stones; north → wool-shed |
| `standing-stones` | Standing Stones | 8,1 | west → sheepfold; north → peat-cut; east → lintel-field |
| `lintel-field` | Lintel Field | 9,1 | west → standing-stones; north → black-ditch; south → salt-grass |
| `salt-grass` | Salt Grass | 9,0 | north → lintel-field |
| `peat-cut` | Peat Cut | 8,2 | south → standing-stones; north → barrow-mouth; east → black-ditch |
| `black-ditch` | Black Ditch | 9,2 | south → lintel-field; west → peat-cut; north → crow-stile |
| `crow-stile` | Crow Stile | 9,3 | south → black-ditch; west → barrow-mouth |
| `barrow-mouth` | Barrow Mouth | 8,3 | south → peat-cut; down → barrow-nave; east → crow-stile |
| `barrow-nave` | Barrow Nave | 8,3 z -1 | up → mouth; north → fog-hollow |
| `fog-hollow` | Fog Hollow | 8,4 z -1 | south → nave |

`east-meadow` gains `north` → `moor-track`. NPCs: Wren, Hobb, Sile, Kern. Reserved `shepherd wren`, `colm`, `keeper holm`, `foldhand hobb`, `reedcutter sile`, `stoneward kern`. Enemies: `mist-crow`, `peat-adder`, `barrow-guard`, `fog-walker`, `fold-hound`, `reed-wisp`, `ditch-lurker`. Seven spine quest files, plus the three side files above. Shared fixtures; do not consume Colm.

Engine: `requiresQuestIds`; Alder leave gated on Sleeps; per-enemy `victoryNarration`.
