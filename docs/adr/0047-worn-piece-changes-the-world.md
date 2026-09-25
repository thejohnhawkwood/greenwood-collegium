# ADR-0047: A worn piece may change how you are seen and where you are let in

## Status

Accepted, September 24, 2026.

## Context

Worn gear existed ([ADR-0040](0040-paper-doll-slots.md) slots,
[ADR-0043](0043-paper-doll-helps.md) once-per-fight help) but could only ever soften
a hit or a cast. The co-created questline
([HANDOFF-COCREATED-QUESTLINE.md](../content/quests/HANDOFF-COCREATED-QUESTLINE.md))
asks for two stories that need equipment to do something else: David's mask, which
changes how a Collegian is seen, and Adrian's costume, which opens a closed camp.

Neither should become a second ruleset. The handoff is explicit: no percentage
stats, no second inventory, no vampire mode.

## Decision

Two optional fields on an item template, both requiring an `equipSlot`, so a
costume stays an ordinary item on the paper doll:

- **`examineRider`**: plain text appended when somebody examines the Collegian
  wearing it. Their own description still leads. Several worn riders all append.
- **`admitsRoomId`**: while worn, this piece admits the wearer to that room.

A room is closed **because** some item claims to admit it. There is no separate
"locked" flag to forget, and validation refuses an `admitsRoomId` naming a room that
does not exist.

Refusal is ordinary narration, never hidden syntax. A closed room may write
`admissionRefusal`; without one the engine uses a plain default. `handleMove`
returns the existing `exit_closed` code, so the client needs no new case.

Admission is checked on entry only. Taking the costume off inside does not eject
you; walking back in without it is refused again.

## Consequences

`the-pressed-mask` and `the-passed-sentry` become content, not code. Any later
story can close a room by authoring one item.

Deliberately out of scope: no stat change of any kind, no NPC dialogue branch on a
worn piece (that is a per-NPC engine decision, as ADR-0046's page hook showed), no
effect on `travel` or `seek` beyond the same admission check they already route
through `handleMove`, and no change to ADR-0043's once-per-fight reduction.

A worn rider is visible to classmates, so a mask is a social fact rather than a
private one. That is the point of David's story and should stay true.
