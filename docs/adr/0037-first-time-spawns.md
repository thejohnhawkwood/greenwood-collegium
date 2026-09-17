# ADR-0037: First-time spawn memory

## Status

Accepted, 16 September 2026.

## Context

Killing a dummy or queen marked the shared spawn `defeated` for the whole
process. The next student who had never fought it saw an empty room. Unique
copies per Collegian would also break the Silk Queen: three students must stand
at one foe.

## Decision

- Keep one spawn. Do not mint a personal dummy, hatchling, or queen.
- Record victory on the Collegian (`defeatedSpawnIds`). Solo foes hide from
  students who have already stood and stay visible to first-timers.
- A `minParty` boss is visible and will square up when at least one Collegian
  in the room has not stood. If everyone present has stood, she does not rise.
- Experience and authored loot go to first-timers on that kill. Veterans who
  help a first-timer do not get the lesson twice.
- Encounter memory is process-local until a later persistence ticket.

## Consequences

Classroom groups can still open the Deep Cradle when one new student arrives.
The orchard dummy remains a first lesson, not a farm, for the student who
finished it.
