# ADR-0032: Painted character catalog and room scenes

## Status

Accepted for the painted-catalog pass, September 16, 2026.

## Context

ADR-0030 shipped a play shell and saved appearance, but Collegian and room
illustrations were deterministic SVG placeholders. The owner rejected SVG/JS as
the look and asked for original painted woodland art, deeper creation sliders,
a paper-doll pose reserved for later clothing, and decorated rooms. Cycle B map
fog stays unchanged.

## Decision

- Appearance writes are version 2. New discrete keys are muzzle, ears, dusk/cream
  palettes, mask/speckled markings, and a hat accessory. `resolveAppearance`
  upgrades v1 JSON with fixed defaults (`muzzle: tapered`, `ears: neat`). Species
  remains on the character record. The profile stays cosmetic.
- Migration `0010_character_appearance_v2.sql` only changes the JSONB default.
  Existing rows are not rewritten; admission and names are untouched.
- One client compositor paints a complete look plate for creation, the paper doll,
  and nearby avatars. File names are a pure function of species, gender, and look
  (`looks/{species}-{gender}-{look}.png`). Look ids are the persisted `clothing`
  keys: Courtyard (`fern`), Scriptorium (`indigo`), and Road (`russet`). Clothes
  are painted into each plate. Gender stays on the character record. Live
  workshop controls are body type, look catalog, silhouette, and palette hue.
  Shared overlay stamps are not switched on top. Reserved slots `outer`,
  `headwear`, `held`, and `weapon` exist and stay empty.
- Size and colouring sliders snap to authored keys. There is no runtime image
  service and no infinite hue.
- Rooms may declare `visualState` (default: room id). Each mapped room must have
  `apps/web/public/art/rooms/<visualState>.png`. `RoomScene` paints that plate;
  title, entities and exits remain server HTML. Open `/?rooms=1` to compare the
  twenty-five finished scenes.
- Art is original. Gwelf and Beatrix Potter are atmosphere references only.

## Consequences

Missing layers show a labelled fallback instead of crashing. Teachers renaming a
Collegian still keep the saved profile. Later equipment can occupy reserved
slots without a new pose.
