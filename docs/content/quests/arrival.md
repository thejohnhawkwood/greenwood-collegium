# Arrival at the Collegium

- **Series:** spine (first beat)
- **Status:** live
- **Stable id:** `arrival-at-the-collegium`
- **JSON:** [`packages/content/quests/arrival-at-the-collegium.json`](../../../packages/content/quests/arrival-at-the-collegium.json)
- **IDs / exits:** [room-and-quest-summary.md](../room-and-quest-summary.md#arrival-at-the-collegium)
- **Spine:** [STORY.md](../STORY.md)
- **Play / author:** [adventures.md](../adventures.md)
- **Next:** [College lessons](college-lessons.md)

Auto-starts on join. 10 XP plus Porter's Cord. No `giverNpcId`. Completing summons the Collegian to the High Study for school pick.

The join notice, after character creation, is the introduction: the College is the bright safe place, the wood outside keeps what it takes, students train as defenders, Schools are a chosen path, faculty have been outside, and the tower, moor, and river are named as mysteries without spoiling them.

## What the student types

`look`, then `say hello`, `take key`, `north`.

Objectives: look in Lantern Court; any `say`; take `small-copper-key`; visit `great-hall`. Join auto-look does **not** count.

## Keep / change

- **Keep** the id and the four objectives.
- **Problem:** intro “stars that have come down to listen.” Porter vanishes from the emotional map after the Great Hall.
- **Rewrite intent:** lanterns are blue glass, cold well-water, whistle on a cord, oak overhead. Bramble watches you go north; the court stays home.
- **Later tree node** (after Holm is known, see [What Still Sleeps](what-still-sleeps.md)): the key-board had a hook for the stair keepers.

## Porter

Teach `look`, `say`, `take`, `north`. He is welcome, not a detective. He will not spoil the queen.
