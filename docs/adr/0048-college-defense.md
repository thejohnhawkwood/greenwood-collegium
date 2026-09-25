# ADR-0048: A teacher may call one defense of the college

## Status

Accepted, September 25, 2026.

## Context

Caleb's design in the co-created queue
([HANDOFF-COCREATED-QUESTLINE.md](../content/quests/HANDOFF-COCREATED-QUESTLINE.md))
is the only item that is not a side story: raiders reach the grounds, every Collegian
online hears it, and personal errands wait. `admin announce` could already reach every
transcript, but it is a line of speech, not a state the world is in.

The owner cut the punishment half of that design before any code existed. A loss must
not delete quests, ink, gear, or progress, and must not lock a room against the
students who turned up.

## Decision

**One process-wide phase**, `quiet` → `fighting` → `closed`, on `WorldState.defense`,
owned by `packages/game-engine/src/college-defense.ts`. Not a per-character flag, so
every Collegian is in the same night.

**A teacher calls it.** `admin defense start [minutes]`, `admin defense cancel`,
`admin defense status`, beside `admin announce`, audited under a new `defense` action.
Students are refused by the existing `canModerate` gate. A second call while one runs
is refused with the clock rather than stacked.

**Seven minutes is the ceiling** (owner's number), and the default. The clock is in
minutes, unrelated to `COMBAT_LOCK_MS`.

**Everybody online hears Alder** on the call, and anybody who joins or reconnects while
the phase is `fighting` hears him again with the minutes that are left. A student who
missed the start is exactly who needs it.

**New errands wait; started errands do not.** While `fighting`, `startQuest` returns
Alder's "the yard first" line instead of opening a quest. A quest already active still
reminds and still progresses, so nobody loses work they were in the middle of.
Movement, `look`, `attack`, `cast`, and `defend` are untouched, and so are `travel` and
`seek`.

**The clock closes itself twice over.** One `setTimeout` broadcasts Flint calling the
yard closed. `settleDefense` also closes a stale phase lazily whenever anything reads
it, so a process that missed its own timer still tells the truth.

**A restart resumes.** The phase persists to one row, `college_defense` (migration
`0016_college_defense.sql`). On boot a defense with time left comes back `fighting`
with the remaining minutes; one whose clock ran out during the restart comes back
`closed`, so the class sees the aftermath rather than a fight nobody is having.

**Cancel is the adults calling it off.** It closes the phase and rolls nothing back.

## Consequences

No punishment exists anywhere in this feature, by construction rather than by policy:
there is no code path that removes anything from a character. Offline Collegians are
paid nothing and lose nothing.

Raiders, the gates, the trophy, and the aftermath shipped the same day, in a second
slice. They reuse the existing spawn and personal-copy loot paths rather than a second
reward system:

- `college-raider` is a declared enemy template with no placement. To mint one at
  runtime the loader now also exposes `enemyTemplates` on the world, so the stats stay
  in JSON and no enemy numbers live in engine code.
- `openDefenseGates` puts about one raider per two Collegians online at each of the
  three gates, never fewer than three, and is idempotent for a given night.
- Every spawn id carries the defense id, so a trophy can only come from the night it was
  won in. `clearDefenseSpawns` removes them all on close or cancel, so no raider outlives
  the night.
- `defenseAftermathLine` appends one line to a gate's description while the phase is
  `closed`. It never changes an exit.

One cost worth naming: `defeatedSpawnIds` grows by roughly a dozen ids per defense and is
never pruned. That is a few hundred short strings across a term, which is acceptable, and
it is the price of a trophy that cannot leak between nights.

`DEFENSE_GATE_ROOM_IDS` names Lantern Court, the East Meadow, and the South Orchard and
lives with the phase so the gates slice and the narration cannot disagree.
