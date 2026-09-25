# Quill's Second Book

- **Series:** side (never required)
- **Status:** live
- **Stable id:** `quills-second-book`
- **JSON:** [`packages/content/quests/quills-second-book.json`](../../../packages/content/quests/quills-second-book.json)
- **Spine:** [STORY.md](../STORY.md)
- **Play / author:** [adventures.md](../adventures.md)
- **Designer:** Lennox, Deep Dive 01. Queue: [HANDOFF-COCREATED-QUESTLINE.md](HANDOFF-COCREATED-QUESTLINE.md)

Giver `npc-librarian-quill` in the Library Stacks. Requires `the-missing-pages`, and
does not replace it. 20 XP. Item `oak-and-bronze-book`.

A second gap in the borrowing register, older than the lantern wren. *Oak and Bronze*
was signed out to the High Study and never signed back. Quill does not accuse the
Headmaster of theft; she accuses the Headmaster of a desk.

## What the student types

`talk quill` in the Library Stacks. `talk alder` in the High Study. North from the
Stacks to the Archive Cellar. `attack bat`, three times, because there are three of
them. Then `talk quill`.

## Author notes

The bats are nesting, not cursed. Quill would rather you moved them than harmed them
and has been outvoted by the bat. They are weak on purpose: 8 health, 2 attack. Each
drops a lavender sachet, which is the archive's losing argument with the moths.

The ending is deliberately the duller one, and Quill says so: misfiled, not stolen,
not late. She hands the book back and tells you to read the fourth chapter and come
and argue with her about it. The book is about bell cradles cut from living trees,
which is the thing the Clock Tower already told you.

**Known thinness.** The `ask-alder` objective fires on any `talk alder`; he has no
line about the book, because his node selection is engine code and a book node would
mean another hook. The quest's reminder text carries what the student is asking him.
If Alder ever gets a side node, this is the first customer.
