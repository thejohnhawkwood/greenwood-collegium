# Painted catalog art bible (DS-004)

Original checked-in paintings replace Cycle A SVG placeholders. Match
`apps/web/public/frame/arrival-students.png`: watercolor and gouache, soft
woodland light, warm cobbles, moss, and animal students who look handmade, not
glossy. Gwelf and Beatrix Potter are atmosphere only. Do not copy franchise
characters, costumes, or compositions. No baked UI text.

## Collegian pose

- Transparent or chroma-keyed PNG, 512×768, 3/4 standing, feet planted, arms
  clear of the torso, head readable in an avatar crop.
- Each species has a female and a male body. Body files are
  `{species}-{gender}-{build}.png`. Open `/?builder=1` to compare the catalog.
- Layer order: complete look plate, palette hue, then reserved empty `outer`,
  `headwear`, `held`, and `weapon`. Do not live-switch shared overlay stamps.
- Look plates live at `looks/{species}-{gender}-{look}.png`. Courtyard, Scriptorium,
  and Road are finished paintings with clothes already on the figure.
- Builds are authored body files; the compositor also slightly scales slender
  and sturdy so the silhouette stays readable if a build file matches rounded.

## NPC and object tokens

- NPC plates live at `characters/npcs/{id}.png`, 512×768, chroma-keyed then
  punched to transparency. Clicking a token zooms the full figure to Collegian
  portrait size on the room painting.
- Object plates live at `objects/{id}.png`, 512×640, same punch. Every current
  room fixture and the five takeable items have a unique still-life.

## Rooms

- 1600×900 painted plates, one per current Collegium room.
- Each plate is a finished place: authored fixtures, lived-in clutter, and
  a distinct composition. Empty halls with swapped props are not enough.
- No characters required. No signs with readable words or numerals.
- Existing bough frames remain chrome around the painting.
- Open `/?rooms=1` to compare the catalog. In play, title, inhabitants, and
  exits stay server HTML over a lighter vignette.

## Creation

The first-character workshop picks species, body, and a complete look, then snaps
size and colouring. The same compositor renders the play-shell doll.
