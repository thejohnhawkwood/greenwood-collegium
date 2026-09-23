# ADR-0039: Field Primer ranks and three choices

## Status

Accepted, 20 September 2026. The three-card offer is superseded by
[ADR-0042](0042-primer-leaf-graphs.md). Ranks, the ink cap, and one Primer
remain.

## Context

Year-marks dumped a School kit at level 3 and capped careers at 10. Students
asked for a personal book, visible numbers, and Vampire Survivors-style picks
after college. Teachers still need a dummy-and-talk loop in the hearths.

## Decision

- Every Collegian carries a personal Field Primer (`starterPerCharacter`). The
  moss-bound primer in the Stacks stays the one school copy.
- `grimoire` / `spells` reads the book. Leaves show rank 1–5, the numbers
  `cast` uses, and the hearth mentor's hand. Unearned leaves stay foxed blanks.
- College (lessons 1–5) is teacher-and-dummy. First lessons ink all three
  starter leaves at rank 1. Lessons 4–5 require a mentor task, then three
  typed choices. The living frame paints those same three as clickable cards
  with the offered numbers and a description. Clicking sends `1`, `2`, or `3`.
  Lessons 6–20 open three choices on the character level.
- Each pick inks a new leaf at rank 1 or raises an owned leaf by 1, cap 5.
  A 1–20 career has 20 ink (3 + 17). Seven leaves at rank 5 would need 35.
- Offers are server-built with injectable `random`. Soft tag weights bias a
  book toward itself. Courtesy neighbor starters may appear from lesson 8.
  Repeat command ids and persisted `pendingPrimerChoices` do not reroll.
- Orchard Ember stays Flint's practice spark. `cast` checks an inked leaf
  except for Ember. Dummy kills grant no lesson. Presentation keys stay
  cosmetic.
- Character level still raises +4 max health and +2 max focus. `stats` shows
  School, Primer leaves, and the next published lesson, not a silent bar.

## Consequences

Postgres stores `known_spells`, `pending_primer_choices`, and
`primer_awarded_levels`. ADR-0037's dummy stay-up extends to the six hearth
dummies. Rooms for lessons 11–20 stay a later content pass. No Strength, no
type chart, no shop. The living catalog of leaves and ranks is
[PROGRESSION.md](../content/PROGRESSION.md).
