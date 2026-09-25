# The Passed Sentry

- **Series:** side (never required)
- **Status:** live
- **Stable id:** `the-passed-sentry`
- **JSON:** [`packages/content/quests/the-passed-sentry.json`](../../../packages/content/quests/the-passed-sentry.json)
- **Spine:** [STORY.md](../STORY.md)
- **Designer:** Adrian, Deep Dive 01. Queue: [HANDOFF-COCREATED-QUESTLINE.md](HANDOFF-COCREATED-QUESTLINE.md)

Giver `npc-scout-tern` at the Reed Bank. Requires `the-black-mooring`, so the river
chain is finished and the boats are home. 30 XP. Item `terns-copied-column`.
First consumer of `admitsRoomId` ([ADR-0047](../../adr/0047-worn-piece-changes-the-world.md)).

Marram has his boats back. Tern has the question he did not ask: where did the cargo
go? Not the camp you cleared — the one behind the osiers that nobody can see into.

## What the student types

`talk tern` at the Reed Bank. `attack sentry` in the Osier Holt to get the ring.
`equip ring`. `east` into the Withy Camp. `examine slate`. `talk tern`.

Walk east without the ring and a basket-weaver stands in the gap between the drying
frames, looks at your collar, paws, and face in that order, and simply keeps standing
there until you step back. That refusal is ordinary narration, not a puzzle.

## Author notes

New room `osier-camp`, the Withy Camp, east of the Osier Holt. Closed because
`withy-ring` names it in `admitsRoomId`. Its `admissionRefusal` is the weaver in the
gap. The room has its own plate, `rooms/osier-camp.png`.

The costume is a normal `ring`: spliced, not knotted, which is the point — anybody
can knot a withy and only somebody taught in that camp can splice one. It carries an
`examineRider`, so a classmate can see you are wearing their mark.

The camp is not a cult and the sentry is not a monster. She is doing real work, there
is a proper pile of cut withy to prove it, and she asks what you want before she does
anything else. The intel is a tally kept **properly, in columns**, which is the actual
unsettling part: somebody taught them to keep a ledger. Tern says so out loud and
tells you to take the ring off before you go back up the bank.

Losing a fight inside the camp is an ordinary combat loss. You keep the ring, because
you already hold it, and you do not drop your pack.

The salt-grass escort from the same paper is deliberately not folded in here; the
handoff asks for it as a separate quest.
