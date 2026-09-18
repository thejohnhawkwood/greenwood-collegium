# ADR-0038: Consented classroom duels

## Status

Accepted, 16 September 2026.

## Context

Classroom mode used to forbid all player-versus-player combat. Students asked
to practice against each other in the same room. Surprise attacks still have
no place in a Grade 9–12 class.

## Decision

- A Collegian may type `duel <name>` to ask a classmate in the same room.
- Combat starts only after `duel accept`. `duel decline` or dismissing the
  prompt ends the request.
- `attack` on a classmate without an accepted duel is still refused.
- Both lock moves on the same twelve-second clock. There is no enemy AI.
  The loser wakes in the Infirmary. No loot. No experience.

## Consequences

Classroom safety still forbids surprise PvP, public registration, and private
messages. ADR-0005's blanket "no PvP" line is superseded for consented duels
only.
