# Art handoff — quest plates for the co-created sides and the college defense

**Date:** 25 September 2026  
**From:** audit of content landed through `da8ec2e` (pull request #82)  
**For:** the Greenwood art agent (`greenwood-art`)  
**Owner:** Philip Bird approves a named revision. This file does not approve any picture.

## What this is

Six live stories added people, foes, a room, fixtures, and carried items. They are playable. They do not have their own paintings.

- `osier-camp` sets `visualState` to `pirate-camp`, so the Withy Camp is drawn as the pirate camp.
- Quire, Vane, Tern, Shellington, the archive bat, the withy sentry, and the college raider are absent from `NPC_PLATE_FILES` in `apps/web/src/app/npc-plates.ts`, so `npcArtSrc` returns nothing.
- The fixtures and items below are absent from `OBJECT_PLATE_FILES` in `apps/web/src/app/object-plates.ts`, so `objectArtSrc` returns nothing.

**21 plates.** Do not redraw plates that already exist. The east-river set in [`HANDOFF-EAST-RIVER-PLATES.md`](HANDOFF-EAST-RIVER-PLATES.md) is drawn. The bell rooms, combat effects, and arrival procession in [`SLICES.md`](SLICES.md) are drawn.

Stories that need no new plate of their own, because the giver and the rooms already have art: Lumen (Shellington’s giver), Quill, Kern, Hobb, Sile, Alder, Flint, the East Gate, Bell Stair, Scriptorium, Webbed Cloister, Archive Cellar, Crow Stile, Osier Holt, Reed Bank, Lantern Court, East Meadow, and South Orchard.

## Read before any picture

1. `GREENWOOD_ART_DIRECTION.md` — the creative brief. Follow it. Sections 2 and 5 are the locked look.
2. `GREENWOOD_ART_ASSET_AGENT.md`
3. `docs/art/SLICES.md`
4. This file

The locked look is the comic-ink pass (22 September 2026). Masters, candidates only:

- `art/sources/character_mouse-female-fern_look__v007__comic-ink.png`
- `art/sources/character_hare-female-fern_look__v005__comic-ink.png`
- `art/sources/room_lantern-court__v003__comic-ink.png`

Heavy near-black album contour, thick enough to read at a glance, sitting on flat local colour. One darker shadow of that same colour. Fur colour stays on fur. Cloth colour stays on cloth. Interior lines for clothes, fingers, and features are the same black pen. A smooth painting with no heavy ink fails. A paper-texture filter over a smooth painting fails. Do not copy those three masters onto a different character or room. Do not copy Asterix, Obelix, Gwelf, Redwall, or any other comic, book, or game characters or lettering. No gore, no sexualized characters, no decorative religious or occult symbols. The pressed mask is a silk shell of a face, not a wound and not a holy or occult emblem. The raider carries a pry-bar and a sack, not a weapon posed for a fight illustration.

## Prompt — paste this, then the subject line

Follow `GREENWOOD_ART_DIRECTION.md`. Do not replace this block with “storybook fantasy.” Where section 4 of that file still describes thin watercolour and bare-paper gaps, the lock in sections 2 and 5 wins: heavy black contour, flat local colour, one darker shadow of the same colour.

Style block, from section 5. Keep it intact on every plate:

```text
Greenwood locked style: the comic-ink pass of 22 September 2026.
Heavy near-black album contour, thick enough to read at a glance, on top of
flat local colour. One darker shadow of the same colour. Fur stays fur.
Cloth stays cloth. Masters: mouse v007 comic-ink, hare v005 comic-ink,
Lantern Court v003 comic-ink, under art/sources/. Do not copy those
characters onto a different species. Do not copy Asterix, Obelix, or Gwelf
characters or lettering. No missing ink, no camouflage stains, no smooth
digital painting.
```

Negative block. Use it as ordinary prompt text unless the tool has a verified separate negative field. Do not invent weights or model syntax.

```text
Avoid smooth digital painting, airbrushed fur, glossy CGI, plastic fur,
photorealism, cinematic bloom, oversized baby eyes, plush mascots,
anime/chibi proportions, neon effects, ornate RPG clutter, and fake grain
over a smooth render. The locked line is a heavy black comic contour with
flat local colour behind it. Do not drop that ink. Do not camouflage fur
onto cloth. Do not copy Gwelf, Asterix, or Obelix characters or lettering.
No gore, no sexualized characters, no decorative religious or occult symbols.
No signatures, watermarks, or invented lettering.
```

Subject block. Replace the brackets from the table for that one plate. Keep the framing line that matches the kind.

```text
Create an original illustration for Greenwood, a grounded woodland academy.
Follow GREENWOOD_ART_DIRECTION.md. The locked look is the comic-ink pass
above. Make a new Greenwood subject. Do not copy a master, a Gwelf character,
or another plate in this catalogue.

SUBJECT
[Species or object]. [Role]. [The concrete clothes, tools, and wear from the table].
Pose: [one still pose a student can recognise in a room].
Setting: isolated asset. No room behind a cutout. A room plate is the place itself, full bleed.

FRAMING
People and foes: upright three-quarter figure, 512×768, solid chroma #EE3173 behind the figure, margins so ears, tail, and tools are inside the frame.
Objects and fixtures: the thing alone, centred, 512×640, same chroma behind it.
Rooms: 1600×900, full bleed, no chroma, no border, no caption.
```

Classroom ceiling, from `docs/content/STORY.md`: named loss is allowed as aftermath. No gore, no wounds catalogued, no on-screen eating, no torture. Holm and Colm are not in this list. Shellington is brought back, not buried: grey under the fur, then gone. The archive bat is nesting, not cursed. The withy sentry is a worker with a billhook at rest. The raider came for the stores.

## Mode

Default remains **AUDIT** until Philip says **CREATE**.

When CREATE is given:

- One plate at a time. Candidates stay in `art/sources/`. Do not write `apps/web/public/art/` until a later **INTEGRATE** names the revision.
- Stop after the four calibration plates and report before the other 17: `osier-camp`, `npc-collegian-quire`, `shellington`, `pressed-mask`.
- Do not change quests, rooms, map coordinates, combat, or equipment rules to make a picture easier.
- Do not deploy from an art session unless Philip asks.

## Technical contract

| Kind | Count | Live file | Size | Mode |
| --- | --- | --- | --- | --- |
| Rooms | 1 | `apps/web/public/art/rooms/{id}.png` | 1600×900 | RGB, full bleed, no leftover magenta |
| People and foes | 7 | `apps/web/public/art/characters/npcs/{id}.png` | 512×768 | RGBA cutout |
| Fixtures and carried items | 13 | `apps/web/public/art/objects/{id}.png` | 512×640 | RGBA cutout |

Cutouts punch one chroma key only: `#EE3173`. The fitter for the east set is `tools/prepare-east-watch-plates.py`. Extend a sibling for this catalogue. Do not overwrite that script’s existing file lists, and do not punch a second pink.

Room art is chosen in `apps/web/src/app/portrait-layers.ts` (`roomArtSrc`). People and foes use `npcArtSrc`. Fixtures and items use `objectArtSrc`. A carried copy whose id contains the template id already resolves if the plate file is `{template-id}.png`.

Integration, only after a named approval:

- Room: remove `visualState` from `packages/content/rooms/osier-camp.json` once `apps/web/public/art/rooms/osier-camp.png` exists. Until then it must keep borrowing `pirate-camp`, because `validateRoomArt` requires a png.
- People and foes: add the template id to `NPC_PLATE_FILES` and `NPC_PLATE_ALIASES`. Spawn ids:
  - `enemy-shellington-crow-stile` → `shellington`
  - `enemy-archive-bat-root`, `enemy-archive-bat-shelf`, `enemy-archive-bat-stair` → `archive-bat`
  - `enemy-withy-sentry-osier-holt` → `withy-sentry`
  - every id that starts with `defense-` → `college-raider` (minted per night; there is no fixed placement file)
- Fixtures and items: add the id to `OBJECT_PLATE_FILES`.
- Bump `NPC_ART_REV` in `npc-plates.ts` when a character plate changes.
- Candidates never replace a live file in place. Keep the previous file for rollback.

## Already painted — leave these

- Every plate in [`SLICES.md`](SLICES.md) and every plate in the east-river handoff
- `pirate-camp` (the Withy Camp borrows it until `osier-camp` is approved)
- Lumen, Quill, Kern, Hobb, Sile, Alder, Flint, and the rooms named in the opening section

## Calibration first (4)

| File | Subject |
| --- | --- |
| `rooms/osier-camp.png` | Withy Camp. Drying frames hide it from the river. Baskets stacked by size. A chalk slate. Not the pirate camp. |
| `characters/npcs/npc-collegian-quire.png` | Collegian Quire. Third-year vole, moor boots, hood, ink-stained paw, empty side pocket. |
| `characters/npcs/shellington.png` | Shellington. Grown otter, Collegium satchel, diary, grey under the fur. Brought back, not buried. |
| `objects/pressed-mask.png` | Pressed mask. A silk shell of a face, weak-tea colour, a muzzle print. Not a wound. |

## Room (1)

| File | Place | Borrowing |
| --- | --- | --- |
| `osier-camp.png` | Withy Camp, east of the Osier Holt. Cut withies in drying frames on three sides, so the river cannot see in. Baskets stacked by size. A slate of chalk columns against the nearest frame. Green Collegium twine still on two bundles. | pirate-camp |

## People (3)

| File | Who |
| --- | --- |
| `npc-collegian-quire.png` | Third-year vole at the East Gate. Boots laced high, satchel strapped, hood up, right paw ink-stained to the second joint. She keeps checking an empty side pocket. Borrowed Ink. |
| `npc-stairkeeper-vane.png` | Adult hedgehog on the fourth step of the Bell Stair. Canvas apron, wick shears, oil tin, a rag gone black. Quills singed short along one shoulder. She trims a wick before she looks up. Pressed Mask. |
| `npc-scout-tern.png` | Common tern in the shallows at the Reed Bank, back to the river so she can watch the bank. White and grey. A pencil stub tucked under one wing. Tern is not a playable Collegian species. Draw an original scout. Passed Sentry. |

## Foes (4)

One plate each. Three bats share `archive-bat`. Every raider at the gates shares `college-raider`.

| File | Who |
| --- | --- |
| `shellington.png` | Grown otter on the Crow Stile. Collegium satchel-strap, diary open on the same page. Grey under the fur at the neck and in the eyes. He is still Shellington. No blood. |
| `archive-bat.png` | Long-eared bat the length of a paw, hanging from a cellar root, wings folded like a shut book. Nesting, not cursed. Archive Cellar. |
| `withy-sentry.png` | Grown stoat on a cutting stool in the Osier Holt. Sleeves tied back, billhook across her knees, a spliced withy ring on the right paw, a pile of cut withy. She asks what you want. The billhook is at rest. |
| `college-raider.png` | A grown animal in a hood at a college gate. Grain sack half full, pry-bar, boots for running. Nothing martial. They came for the stores. |

## Fixtures (2)

| File | What |
| --- | --- |
| `object-tally-slate.png` | A slate of chalk columns against a drying frame. Three columns. A running total at the bottom. |
| `object-drying-frames.png` | Withy frames set close enough to hide a camp, angled to the sun. Some bundles still tied with green Collegium twine. |

## Carried items (11)

| File | What |
| --- | --- |
| `borrowed-ink.png` | Squat glass bottle of oak-gall ink, cork, candle wax over the stopper. An initial scratched in the wax. |
| `quires-focus-ring.png` | Narrow grey metal band, worn thin on the inside. No jewel. |
| `pressed-mask.png` | Face-sized shell of hardened silk. Smooth inside, ridged outside, a muzzle print, the colour of weak tea. Almost no weight. |
| `vanes-wick-tin.png` | Flat tin that does not quite shut. Coiled fresh wick, a taper stub, a scrap of black rag. |
| `shellington-diary.png` | A field diary. Neat pages, then the last two pressed harder. No readable invented prose on the cover. |
| `cellar-lavender.png` | Small stitched linen bag of dried lavender. A year written on the seam, small enough to be a mark, not a paragraph. |
| `oak-and-bronze-book.png` | Thin book, boards warped along the grain, faded gilt title. A borrowing slip tucked inside. |
| `withy-ring.png` | A finger ring of three split withies, finished with a splice, not a knot. |
| `terns-copied-column.png` | A strip of paper with one column of marks copied by hand. Not a full page of readable text. |
| `fold-tally-page.png` | One page torn along a fold from a tally-book. Three hands. Three dates left as marks, not as a paragraph. |
| `raiders-token.png` | Flat wooden disc on a broken thong. A grain measure stamped on one side. Three notches on the other. |

## Story sources

Prose for these subjects lives in the room, item, and enemy JSON under `packages/content/`, and in:

- `docs/content/quests/the-borrowed-ink.md`
- `docs/content/quests/shellington.md`
- `docs/content/quests/quills-second-book.md`
- `docs/content/quests/the-pressed-mask.md`
- `docs/content/quests/the-passed-sentry.md`
- `docs/content/quests/the-defense.md`
- `docs/content/quests/the-east-watch.md` (One Page for Three; the page is the only new plate)
- `docs/content/STORY.md`

## Record

```text
Asset name / ID: see tables above (21)
Purpose and intended display size: room 1600×900 RGB; people and foes 512×768 RGBA; fixtures and items 512×640 RGBA
Source character or object specification: room, enemy, and item examine text in packages/content/
Art direction: GREENWOOD_ART_DIRECTION.md, locked comic-ink pass, sections 2 and 5
Exact assembled prompt: the Prompt section of this file, plus one subject row
Generation tool / model / available settings, or "not generated": not generated
Output path, or "no output file": no output file
Visual review: not visually inspected
Approval status: draft list, awaiting CREATE, then awaiting Mr. Bird
Integration status: not integrated
```
