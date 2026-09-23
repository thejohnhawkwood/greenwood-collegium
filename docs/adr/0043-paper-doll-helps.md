# ADR-0043: Paper-doll helps

## Status

Accepted, 23 September 2026.

## Context

ADR-0040 gave the Collegian eleven wear slots. Combat still read only the
main-hand weapon, and only for a species fit of +1 or −1. Quest souvenirs sat
in the bag. A second gear ladder beside the Primer would hide the lessons.

## Decision

- Help comes from the slot, not from a second number on the template. A worn
  helmet, cloak, armor, or off-hand piece is guard. A worn necklace, ring, or
  gloves is focus help. Boots and the ranged slot are shown and examined.
  They do not change health, focus, or melee damage. Hands keep the species
  fit rule. A ranged weapon still does not replace `equippedItemId`.
- Guard lowers the first incoming hit of that fight by 1. Focus help lowers
  the first cast of that fight by 1 focus. A second piece of the same help
  does not stack. Both clear when the fight ends.
- Quest clothes and tools are personal copies with `equipSlot`. Proofs stay
  in the bag: keys, both primers, the still score, the seed pouch, the straw
  scrap, and the torn silk strand. The three orchard weapons are
  `starterPerCharacter` placements so a class does not race for one sword.
- The journal names the slot from the template ("a cloak you can wear").
  The client does not invent that line.

## Consequences

- Lessons still raise max health and max focus. Gear does not.
- Later stories may offer a different piece for a slot the Collegian already
  filled. The older piece stays in the bag. Wearing it does not add a second
  point of the same help.
- No sling attack in this decision.
