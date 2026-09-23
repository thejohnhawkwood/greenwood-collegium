# ADR-0040: Paper-doll wear slots

## Status

Accepted, 22 September 2026.

## Context

The bag showed one “in hand” item. Classroom play needs a character sheet:
helmet, cloak, armor, gloves, boots, two rings, a necklace, main hand, off
hand, and a ranged weapon. A two-handed weapon has to occupy both hands.
`equippedItemId` is still the melee weapon combat reads, and it is not stored
in Postgres.

## Decision

- Item templates may set `equipSlot`. `two-hand` fills main hand and blocks
  off hand. `ring` fills the first open ring, then replaces the first.
  Sword, staff, and sling infer main hand, two-hand, and ranged when the
  field is omitted. Keys, books, and ordinary items without a slot cannot
  be worn.
- The Collegian keeps `equipment` in memory. `equippedItemId` stays the
  main-hand weapon, including a two-handed one. A ranged weapon does not
  replace it. Dropping an item clears every slot that held it.
- `play-state.slots` always lists the eleven positions. A blocked off hand
  names the two-handed weapon and does not carry a second item id. The
  client draws those slots and does not invent positions. Empty slots use
  a stylized outline.

## Consequences

Worn gear is lost on restart, the same as today’s in-hand weapon. Persisting
the sheet is a later migration. No new item category is required for
two-handed weapons.
