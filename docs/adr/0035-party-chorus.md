# ADR-0035: Party lock-in and the Silk Queen

## Status

Accepted, 16 September 2026.

## Context

DS-007 shipped solo Lock-in Chorus (ADR-0034). Alder and Piper already said a
queen waits until three can stand. A solo queen fight would contradict them.
The owner asked for the next slice: party of three plus What Still Sleeps.

## Decision

- Enemy templates may set `minParty`. The Silk Queen requires 3. Dummy and
  hatchling stay 1.
- When `minParty` is greater than 1, every Collegian already in the room joins
  the encounter. A later classmate who attacks the same spawn joins.
- Chorus turns wait until every living member locks, or the twelve-second clock
  expires. Missing locks become defend. Dummy and hatchling still resolve the
  locking student immediately.
- The queen answers each living member once, then the shared clock starts again.
- One defeat sends that Collegian to the Infirmary; classmates continue. Flee
  drops one member. XP on victory goes to remaining members.
- Alder starts `what-still-sleeps` after The Bell Wakes. Do not invent Strength
  or extra stats.

## Consequences

The Deep Cradle is an honest three-student lesson. The gateway rearms every
member's lock timer. Presentation stays CombatStage; typed commands stay
canonical. First-time standing is per Collegian, not a unique queen per
student ([ADR-0037](0037-first-time-spawns.md)).
