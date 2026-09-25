# Comic-ink slices

Philip Bird locked the comic-ink pass on 22 September 2026. Style masters:

- `art/sources/character_mouse-female-fern_look__v007__comic-ink.png`
- `art/sources/character_hare-female-fern_look__v005__comic-ink.png`
- `art/sources/room_lantern-court__v003__comic-ink.png`

Heavy black contour, flat local colour behind it. Fur colour stays on fur. Cloth colour stays on cloth. Candidates stay out of `apps/web/public/art/` until a named integration. Do not copy Asterix, Obelix, or Gwelf characters.

## Order

1. **Collegian looks.** All 66 comic-ink looks were punched off `#EE3173`, fitted to 512×768, and copied into `apps/web/public/art/characters/looks/` on 23 September 2026. The cache key is `comic-ink-looks-1`. Mouse fern is `v007`, hare fern is `v005`, and the rest are `v001`. Sources stay in `art/sources/`.
2. **Named cast.** The 34 files in `NPC_PLATE_FILES` were punched off `#EE3173` and fitted to 512×768. The first 21 landed on 23 September 2026. The east moor and south river added six people and seven foes the same day. The cache key is `comic-ink-1`. Tansy is `v003`, the hatchling is `v002`, the Silk Queen is `v003`, Foldhand Hobb is `v003`, the Fold Hound is `v003`, the Ditch Lurker is `v002`, and the rest are `v001`.
3. **Rooms.** All 65 room plates were fitted to 1600×900. The first 40 landed on 23 September 2026. Twenty east-moor and south-river rooms followed the same day. Bell Stair, Silk Gallery, Webbed Cloister, Cocoon Nave, and Deep Cradle each have their own plate and no longer borrow the Clock Tower. Sources stay in `art/sources/`. Lantern Court is `v003`, East Meadow is `v004`, Hearth of the Veil is `v002`, and the rest are `v001`.
4. **Objects.** The 109 files in `OBJECT_PLATE_FILES` are in `apps/web/public/art/objects/`. The first 56 were generated 23 September 2026. Thirteen carried pieces were added the same day. The east moor and south river added 40 fixtures and carried items later that day. Foldhand Hobb is `v003`. The Fold Hound is `v003`. The Ditch Lurker is `v002`. The deck token is `v002`. Wooden Guard is `v003`. Thorn Ring is `v002`. The rest of the new set are `v001`.
5. **Combat FX.** The 27 files in `FX_FILES` were redrawn as comic-ink overlays, punched off `#EE3173`, and fitted to 512×768 on 23 September 2026. The cache key is `comic-ink-fx-1`. Sources stay in `art/sources/` as `v001`.
6. **Arrival procession.** `apps/web/public/frame/arrival-students.png` is the comic-ink procession, punched off `#EE3173` and fitted to 1600×900. Source: `art/sources/frame_arrival-students__v001__comic-ink.png`.

Unused body, clothing, ear, muzzle, marking, face, and accessory files stay unused.

## Quest plates

Twenty-one plates from [`HANDOFF-QUEST-PLATES.md`](HANDOFF-QUEST-PLATES.md). Philip Bird authorized CREATE and INTEGRATE on 25 September 2026. Do not redraw plates already in the list above. Continue one slice at a time.

1. **Calibration.** Integrated 25 September 2026. Sources: room `v001`, Quire `v002`, Shellington `v002`, pressed mask `v002`. Live files: `rooms/osier-camp.png`, `characters/npcs/npc-collegian-quire.png`, `characters/npcs/shellington.png`, `objects/pressed-mask.png`. Withy Camp no longer borrows `pirate-camp`. Cache key for character plates is `comic-ink-2`. Quire’s ink stain did not land on the paw.
2. **People still missing.** Integrated 25 September 2026. Vane is `v001` (singed shoulder and black rag did not land; the ground pile still reads as dirt). Tern is `v003`, a common tern with a pencil under one wing. `v001` of Tern was a hare-headed chimera with a caption and was not used.
3. **Foes still missing.** Integrated 25 September 2026. Archive bat `v001`, withy sentry `v001`, college raider `v002` (a fox; the pry-bar is a straight bar). Spawn ids `enemy-archive-bat-*`, `enemy-withy-sentry-osier-holt`, and any id starting with `defense-` use those plates. The sentry’s withy ring is not visible on the paw.
4. **Withy Camp fixtures.** Integrated 25 September 2026. Tally slate `v001` (three chalk columns and a total). Drying frames `v001` (green twine on the bundles; three ties rather than two).
5. **Ink and mask kit.** Integrated 25 September 2026 as `v001`: borrowed ink, Quire’s ring, Vane’s wick tin.
6. **Books and pages.** Integrated 25 September 2026 as `v001`: Shellington’s diary, oak-and-bronze book, cellar lavender, Tern’s column, fold tally page. The lavender bag is open, and a stray tally mark sits in the corner of that source.
7. **Small tokens.** Integrated 25 September 2026 as `v001`: withy ring, raider’s token.
