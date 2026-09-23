# ADR-0044: Combat reads

## Status

Accepted, September 23, 2026.

## Context

A lock-in fight paid the same number for the same button every round. Defend
halved a foe's swing and did not answer a spell, so the useful lesson was to
repeat the strongest leaf. Classroom duels had the same shape.

## Decision

- The same swing, or the same leaf, on the next lock lands at half (at least 1).
  One reason is enough. A different move, a guard, or a self-cast starts the
  count over.
- A foe may list `reads`: `lunge`, `brace`, and `gather`, cycling from round 1.
  The card and the turn line state the current read. The engine writes that
  line. The client does not invent it.
- A lean-in still answers. A guard halves it and loads the next blow (+2).
  Set feet do not answer; a stick glances off and a spark does not. A draw-back
  does not answer. Striking then spoils it. Leaving it alone makes the next
  lean-in hit 2 harder.
- In a duel the classmate is the read. The same lesson from both Collegians
  lands light. A guard covers their swing or their spark and loads the
  defender's next blow.
- A hand-built foe with no `reads` still always leans in. The repeat rule
  still applies.

## Consequences

The practice dummy teaches the three beats and still has no flavor lock line.
Help text for attack, defend, and duel names the reads. Damage numbers stay in
`combat.action_resolved`. A lighter or loaded blow adds `readNote` to that
narration.
