# Quest storylines

Modular author truth. The [spine](../STORY.md) says what order the class walks.
The co-created queue is a handoff, not live content:
[HANDOFF-COCREATED-QUESTLINE.md](HANDOFF-COCREATED-QUESTLINE.md).
Each file below says what one storyline *means*. Live objectives stay in JSON
and in [room-and-quest-summary.md](../room-and-quest-summary.md). Play commands
and JSON authoring stay in [adventures.md](../adventures.md).

## Spine (everyone walks)

1. [Arrival at the Collegium](arrival.md) — `arrival-at-the-collegium`
2. [College lessons](college-lessons.md) — `first-lessons-*` / `second-lessons-*` / `third-lessons-*`
3. [The Bell Below](the-bell-below.md) — `the-bell-below`
4. [The Bell Wakes](the-bell-wakes.md) — `the-bell-wakes`
5. [What Still Sleeps](what-still-sleeps.md) — `what-still-sleeps` (Holm, queen **defeat**)
6. [The East Watch](the-east-watch.md) — `the-meadow-fork` … `the-thing-that-walks`

## Side (never required)

- [The Missing Pages](the-missing-pages.md) — `the-missing-pages`
- [A Little Room to Grow](a-little-room-to-grow.md) — `a-little-room-to-grow`
- [Porter's Night Round](porters-night-round.md) — `porters-night-round`
- [Fen's Linen](fens-linen.md) — `fens-linen`
- [East Watch sides](the-east-watch.md) — `the-empty-byre`, `the-mere-that-keeps`, `the-ninth-scratch`, `one-page-for-three`
- [The River Watch](the-river-watch.md) — `the-cut-painter` … `the-black-mooring`

Flint’s orchard is practice and consented duels, not a quest file.

## How to add a storyline

1. Add a row to this list and to the spine graph in [STORY.md](../STORY.md).
2. Add `docs/content/quests/<id>.md` with the header block used by the files here.
3. Add `packages/content/quests/<id>.json` in a content ticket (not in a docs-only pass).
4. Keep published IDs stable; saved progress references them.
