# The Pressed Mask

- **Series:** side (never required)
- **Status:** live
- **Stable id:** `the-pressed-mask`
- **Outcomes:** `worn`, `returned`
- **JSON:** [`packages/content/quests/the-pressed-mask.json`](../../../packages/content/quests/the-pressed-mask.json)
- **Spine:** [STORY.md](../STORY.md)
- **Designer:** David, Deep Dive 01. Queue: [HANDOFF-COCREATED-QUESTLINE.md](HANDOFF-COCREATED-QUESTLINE.md)

Giver `npc-stairkeeper-vane` on the Bell Stair. Requires `the-bell-wakes`, so the
stair is already part of your story. 25 XP on either path. Uses the fork
([ADR-0046](../../adr/0046-remembered-choice.md)) and the worn rider
([ADR-0047](../../adr/0047-worn-piece-changes-the-world.md)).

Stairkeeper Vane is a hedgehog who keeps the stair lamps lit — the job Keeper Holm
had before her, which she took on knowing that. She works from above the cloister
and will not dress that up as bravery.

## What the student types

`talk vane` on the Bell Stair. Down to the Webbed Cloister, `take mask`. Then one of:

- `equip mask`. Outcome `worn`. Vane does not look away, which costs her something,
  and writes two lines in the stair log. You keep the mask and everyone who examines
  you sees it.
- `talk vane` carrying it unworn. Outcome `returned`. She turns it over with the wick
  shears rather than her paws, puts it face down on the high ledge where it can still
  be seen, and gives you her wick tin. Reward `vanes-wick-tin`.

## Author notes

The frightening change is narration and a rider, not a stat. `pressed-mask` is an
ordinary `helmet` with an `examineRider`, so a classmate who examines you reads that
their own face is somewhere behind it. Nothing else changes. No second ruleset, no
percentages.

The mask is a `starterPerCharacter` placement, so each Collegian finds their own on
the cloister floor and nobody can take another student's.

**Adaptation worth knowing.** The handoff says the keeper pays a smaller gift when
you "give it back". The engine has no way for an NPC to take a held item, and a
completion that claims otherwise would contradict the student's own bag — the same
problem already recorded against Alder and the fold tally page. So Vane never takes
it. She asked only for it in lamplight, and on the `returned` path she sets it on the
high ledge herself and says plainly that she is neither hiding nor burning it. The
gift is for restraint, not for surrender.
