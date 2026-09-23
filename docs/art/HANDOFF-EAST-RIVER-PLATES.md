# Art handoff — east side and south river plates

**Date:** 23 September 2026  
**From:** story pass on the east moor and the south river  
**For:** the Greenwood art agent (`greenwood-art`)  
**Owner:** Philip Bird approves a named revision. This file does not approve any picture.

## What this is

The story pass added rooms, people, foes, fixtures, and carried items. They are playable. They do not have their own paintings.

- New rooms set `visualState` to an existing plate, so the client shows a borrowed room.
- New people and foes are absent from `NPC_PLATE_FILES` in `apps/web/src/app/npc-plates.ts`, so `npcArtSrc` returns nothing.
- New fixtures and items are absent from `OBJECT_PLATE_FILES` in `apps/web/src/app/object-plates.ts`, so `objectArtSrc` returns nothing.

**73 plates.** Do not redraw plates that already exist.

## Read before any picture

1. `GREENWOOD_ART_DIRECTION.md`
2. `GREENWOOD_ART_ASSET_AGENT.md`
3. `docs/art/SLICES.md`
4. This file

The locked look is the comic-ink pass (22 September 2026). Masters:

- `art/sources/character_mouse-female-fern_look__v007__comic-ink.png`
- `art/sources/character_hare-female-fern_look__v005__comic-ink.png`
- `art/sources/room_lantern-court__v003__comic-ink.png`

Heavy black contour, flat local colour behind it. Fur stays fur-coloured. Cloth stays cloth-coloured. A smooth painting with no heavy ink fails. Do not copy comic, book, or game characters. No gore, no sexualized characters, no decorative religious or occult symbols. The ninth scratch is three circles and a line through them, drawn as a mason’s unfinished mark, not as a holy or occult emblem.

## Mode

Default remains **AUDIT** until Philip says **CREATE**.

When CREATE is given:

- One plate at a time. Candidates stay in `art/sources/`. Do not write `apps/web/public/art/` until a later **INTEGRATE** names the revision.
- Stop after the four calibration plates and report before the other 69: `wool-shed`, `npc-foldhand-hobb`, `fold-hound`, `fold-mitts`.
- Do not change quests, rooms, map coordinates, combat, or equipment rules to make a picture easier.
- Do not deploy from an art session unless Philip asks.

## Technical contract

| Kind | Count | Live file | Size | Mode |
| --- | --- | --- | --- | --- |
| Rooms | 20 | `apps/web/public/art/rooms/{id}.png` | 1600×900 | RGB, full bleed, no leftover magenta |
| People and foes | 13 | `apps/web/public/art/characters/npcs/{id}.png` | 512×768 | RGBA cutout |
| Fixtures and carried items | 40 | `apps/web/public/art/objects/{id}.png` | 512×640 | RGBA cutout |

Cutouts punch one chroma key only: `#EE3173`. The fitter for the previous east set is `tools/prepare-east-watch-plates.py`. Extend a sibling for this catalogue. Do not overwrite that script’s existing file lists, and do not punch a second pink.

Room art is chosen in `apps/web/src/app/portrait-layers.ts` (`roomArtSrc`). People and foes use `npcArtSrc`. Fixtures and items use `objectArtSrc`. A carried copy whose id contains the template id (for example `item-quest-the-empty-byre-loot-fold-mitts--…`) already resolves if the plate file is `{template-id}.png`.

Integration, only after a named approval:

- Rooms: remove `visualState` from that room’s JSON once `apps/web/public/art/rooms/{room-id}.png` exists. `validateRoomArt` requires the png for `visualState`, or for the room id when `visualState` is absent.
- People and foes: add the template id to `NPC_PLATE_FILES` and `NPC_PLATE_ALIASES`, including the spawn id (`enemy-fold-hound-mist-lane` → `fold-hound`).
- Fixtures and items: add the id to `OBJECT_PLATE_FILES`.
- Bump `NPC_ART_REV` in `npc-plates.ts` when a character plate changes.
- Candidates never replace a live file in place. Keep the previous file for rollback.

## Already painted — leave these

- `river-landing` and `object-flood-marker`
- `mist-crow`, `barrow-guard`, `peat-adder` (their new drops are in the item table)
- Every plate already listed in `SLICES.md`

## Calibration first (4)

| File | Subject |
| --- | --- |
| `rooms/wool-shed.png` | Wool Shed. Wet wool, one honest lamp. Borrowing sheepfold today. |
| `characters/npcs/npc-foldhand-hobb.png` | Foldhand Hobb. Adult mole, wool vest, lamp-soot on the claws. Not cute. |
| `characters/npcs/fold-hound.png` | Fold Hound. Wet wool and mist in a sheepdog outline. No bark. Not a real dog, and not Colm’s. |
| `objects/fold-mitts.png` | Fold mitts. Damp wool, thumb mended. |

## Rooms (20)

East side. Borrowed plate in parentheses.

| File | Place | Borrowing |
| --- | --- | --- |
| `wool-shed.png` | Wet wool, one honest lamp | sheepfold |
| `croft-byre.png` | Straw, no sheep | wren-croft |
| `mist-lane.png` | Mist at knee height that does not lift | fog-hollow |
| `reed-mere.png` | Still water, a light with no lantern | peat-cut |
| `lintel-field.png` | Fallen gate-stones, one new scratch | standing-stones |
| `salt-grass.png` | Pale grass, no sheep | sheepfold |
| `black-ditch.png` | Black water east of the peat cut | peat-cut |
| `crow-stile.png` | Wet stone between ditch and barrow | barrow-mouth |

South river. All twelve borrow `river-landing`.

| File | Place |
| --- | --- |
| `willow-bend.png` | Willows, a painter cut on purpose |
| `osier-holt.png` | Cut withies, path to the race |
| `reed-bank.png` | West bank, slow brown water |
| `otter-slip.png` | Mud slip where the College boats should rest |
| `flood-store.png` | Locked cellar of tins, twine, and dry biscuits |
| `skiff-line.png` | Flat boats, one of them not ours |
| `mill-race.png` | Fast water, a wheel that no longer turns |
| `rope-island.png` | A willow island posted like a gate |
| `heron-post.png` | Fishing post, whistle missing |
| `pirate-camp.png` | Tarps, tins, one captain |
| `cargo-hollow.png` | Stolen crates under the bank |
| `black-mooring.png` | Tarred post, the captain’s best boat |

## People (6)

| File | Who |
| --- | --- |
| `npc-foldhand-hobb.png` | Adult mole. Wool vest, lamp-soot on the claws. Wool Shed. Has seen a fold go quiet. |
| `npc-reedcutter-sile.png` | Adult toad. Oiled wool, reed-knife on a cord, blade down. Reed Mere. |
| `npc-stoneward-kern.png` | Adult badger. Stone-dust coat, chalk on one claw, old tears mended with wire. Lintel Field. |
| `npc-skipper-marram.png` | Adult otter. Tarred coat, whistle on a cord, ear nicked by a boathook. River Landing. |
| `npc-deckhand-nett.png` | Young-adult mouse. Tarred jerkin, empty cord at the neck. Willow Bend. Left the camp. |
| `npc-heron-midge.png` | Adult heron. Oilcloth vest, fishing spear grounded, not raised. Heron Post. Heron is not a playable Collegian species. Draw an original fisher. |

## Foes (7)

| File | Who |
| --- | --- |
| `fold-hound.png` | Wet wool and mist in a sheepdog outline. No bark. Mist Lane. |
| `reed-wisp.png` | A low cold light with no lantern under it. Reed Mere. |
| `ditch-lurker.png` | Peat and old iron, about satchel-sized, waiting in black water. Not a person. Black Ditch. |
| `deck-hand.png` | Adult stoat, tarred jerkin, wooden skiff token on a cord. Skiff Line. |
| `rope-sentry.png` | Adult badger in a river coat, a cut line in one paw. Rope Island. |
| `river-captain.png` | Adult otter, buttoned river coat, buttons still on. Pirate Camp. No blood. |
| `race-pike.png` | A long dark shape holding the mill race. Not a person. Mill Race. |

## Fixtures (20)

| File | What |
| --- | --- |
| `object-wool-pegs.png` | Pegs of wet fleece. One peg has a bell-loop and no bell. |
| `object-empty-stall.png` | An empty stall |
| `object-lane-mist.png` | Knee-high mist that does not lift |
| `object-still-water.png` | Mere that shows reed and a light, not a face |
| `object-scratch-stone.png` | A lintel. Eight old stones, one pale scratch: three circles and a line through them. A chalk dot beside it. |
| `object-pale-grass.png` | Pale grass, no sheep |
| `object-black-water.png` | Black ditch water |
| `object-stile-stone.png` | Wet stile stones |
| `object-cut-painter.png` | A mooring rope cut clean, tar still soft |
| `object-withy-bundles.png` | Cut osier bundles |
| `object-reed-bundles.png` | Reed bundles on the west bank |
| `object-empty-ring.png` | The empty ring where a College boat should sit |
| `object-biscuit-shelf.png` | Cellar shelf of tins, twine, and dry biscuits |
| `object-thief-knot.png` | A thief’s knot on the skiff line |
| `object-still-wheel.png` | A mill wheel that no longer turns |
| `object-rope-coil.png` | A coil of rope |
| `object-whistle-post.png` | A post with a bright nail and no whistle |
| `object-turnip-tins.png` | Turnip tins in the camp |
| `object-biscuit-crate.png` | A stolen biscuit crate under the bank |
| `object-tarred-post.png` | The tarred post at the black mooring |

## Carried items (20)

| File | What |
| --- | --- |
| `porters-cord.png` | Short leather cord, the spare Porter keeps a whistle on |
| `hearth-biscuit.png` | One hard hearth biscuit |
| `ink-rag.png` | Small rag stained with Primer ink |
| `fold-mitts.png` | Damp wool mitts, thumb mended |
| `reed-cloak.png` | Short oiled-wool cloak |
| `lintel-band.png` | Plain metal band, no jewel |
| `river-boots.png` | Boots tarred at the seam |
| `biscuit-tin.png` | Dented empty tin |
| `skipper-whistle.png` | Small whistle on a wet cord |
| `boarding-oar.png` | Short wooden oar, notched where it met a rail |
| `fold-bell.png` | Small brass bell, tongue wrapped so it will not ring |
| `wisp-glass.png` | Cold river-green glass bead |
| `ditch-nail.png` | Bent iron nail, peat in the threads. Not the abbey bronze. |
| `deck-token.png` | Wooden token stamped with a little skiff |
| `cut-rope.png` | Tarred rope-end, cut clean, not frayed |
| `captain-coat.png` | Short river coat, buttons on, dry lining, tar and biscuit crumbs. No blood. |
| `river-stone.png` | One smooth cold stone |
| `crow-pin.png` | Bent pin from fog-wet feathers. Drop from the existing mist-crow. |
| `peat-nail.png` | Old iron nail. Drop from the existing barrow-guard. Not bone. |
| `cut-iron.png` | A flake of iron from the peat cut. Drop from the existing peat-adder. |

## Story sources

Prose for these places lives in the room and quest JSON under `packages/content/`, and in:

- `docs/content/quests/the-east-watch.md`
- `docs/content/quests/the-river-watch.md`
- `docs/content/STORY.md`

The east side starts after `the-meadow-fork` and does not show what happened to Colm. The river does not touch the bronze bell.

## Record

```text
Asset name / ID: see tables above (73)
Purpose and intended display size: rooms 1600×900 RGB; people and foes 512×768 RGBA; fixtures and items 512×640 RGBA
Source character or object specification: room fixtures and item examine text in packages/content/
Actual reference files inspected: not generated in the story pass
Exact assembled prompt: none
Generation tool / model / available settings, or "not generated": not generated
Output path, or "no output file": no output file
Visual review: not visually inspected
Approval status: draft list, awaiting CREATE, then awaiting Mr. Bird
Integration status: not integrated
```
