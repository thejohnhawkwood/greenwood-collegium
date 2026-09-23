# Comic-ink slices

Philip Bird locked the comic-ink pass on 22 September 2026. Style masters:

- `art/sources/character_mouse-female-fern_look__v007__comic-ink.png`
- `art/sources/character_hare-female-fern_look__v005__comic-ink.png`
- `art/sources/room_lantern-court__v003__comic-ink.png`

Heavy black contour, flat local colour behind it. Fur colour stays on fur. Cloth colour stays on cloth. Candidates stay out of `apps/web/public/art/` until a named integration. Do not copy Asterix, Obelix, or Gwelf characters.

## Order

1. **Female Courtyard looks.** Mouse and hare are the masters. First pass, generated 22 September 2026 and waiting on Philip Bird: badger, otter, squirrel, mole, hedgehog, fox, stoat, owl, toad. Files and hashes are in `art/reviews/female-fern-comic-pass-1.md`. They are not the live plates.
2. **The other looks.** Male Courtyard, both Scriptorium looks, and both Road looks accepted 22 September 2026.
3. **Named cast.** The 21 files in `NPC_PLATE_FILES` were punched off `#EE3173`, fitted to 512×768, and copied into `apps/web/public/art/characters/npcs/` on 23 September 2026. The cache key is `comic-ink-1`. Tansy is `v003`, the hatchling is `v002`, the Silk Queen is `v003`, and the rest are `v001`.
4. **Rooms.** All 40 room plates, including Lantern Court, were fitted to 1600×900 and copied into `apps/web/public/art/rooms/` on 23 September 2026. Sources stay in `art/sources/`. Lantern Court is `v003`, East Meadow is `v004`, Hearth of the Veil is `v002`, and the rest are `v001`.
5. **Objects.** The 69 files in `OBJECT_PLATE_FILES` are in `apps/web/public/art/objects/`. The first 56 were generated 23 September 2026. The 13 carried pieces that had no plate — Patched Hood, Fog-Glass Bead, Peat Lantern, Abbey-Mark Ring, Moor Boots, Linen Wrap, Path Boots, Wooden Guard, Slate Cap, Glass Ring, Quiet Cloak, Thorn Ring, and Hearth Mitts — were added the same day. Wooden Guard is `v003`. Thorn Ring is `v002`. The rest of that set are `v001`.
6. **Combat FX.** The 27 files in `FX_FILES`, Ember first.
7. **Arrival procession.** `apps/web/public/frame/arrival-students.png`, after the species plates exist.

Unused body, clothing, ear, muzzle, marking, face, and accessory files stay unused.
