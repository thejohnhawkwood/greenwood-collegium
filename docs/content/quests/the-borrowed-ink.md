# The Borrowed Ink

- **Series:** side (never required)
- **Status:** live
- **Stable id:** `the-borrowed-ink`
- **Outcomes:** `returned`, `kept`
- **JSON:** [`packages/content/quests/the-borrowed-ink.json`](../../../packages/content/quests/the-borrowed-ink.json)
- **Spine:** [STORY.md](../STORY.md)
- **Play / author:** [adventures.md](../adventures.md)
- **Designer:** Kevin, Deep Dive 01. Queue: [HANDOFF-COCREATED-QUESTLINE.md](HANDOFF-COCREATED-QUESTLINE.md)

Giver `npc-collegian-quire` at the East Gate. Starts after Arrival. 20 XP on either
path. First consumer of the remembered fork, [ADR-0046](../../adr/0046-remembered-choice.md).

Quire is a third-year with her boots already laced, walking to the moor road within
the hour, and her ink is on a desk in the Scriptorium. She cannot go back for it and
keep the light.

## What the student types

`talk quire` at the East Gate. Then the Scriptorium: north to the Great Hall, west
into the Library Stacks, west again, and `take ink`.

Then one of two things.

- `talk quire` at the gate. Outcome `returned`. She checks the wax seal is unbroken
  before she looks at you, is visibly embarrassed about having checked, and gives you
  the ring off her own paw. Reward `quires-focus-ring`.
- `cast ember` anywhere you legally can. Outcome `kept`. The ink is good and the leaf
  is yours. She works the whole thing out in about two seconds when you pass the gate,
  says "It was ink, not a kidney" lightly, and it does not come out lightly. No item.

## Author notes

Both paths pay 20 XP, because `experienceReward` is one number for the quest. The
fork is about what Quire thinks of you, not about which reward is better.

The ink is a `starterPerCharacter` placement, so every Collegian sees their own
bottle on the third desk and nobody can take another student's. That is the same
recipe as the abbey-mark rubbing.

The `kept` branch needs a spell to cast, which every Collegian has after Flint's
spark. `returned` is always available, so the quest can never be stuck.

**Deviation from the handoff, on purpose.** The paper put the giver at the barrow
mouth. That room sits deep in the East Watch, and this quest requires only Arrival,
so a first-year sent there would walk past the barrow-guard to start a side errand.
Quire waits at the East Gate instead, dressed for the moor road she is about to walk.
The intent is kept: she is leaving, and she cannot turn back.
