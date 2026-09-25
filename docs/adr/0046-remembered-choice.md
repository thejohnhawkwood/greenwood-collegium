# ADR-0046: A quest may remember which ending a Collegian chose

## Status

Accepted, September 24, 2026.

## Context

The co-created questline
([HANDOFF-COCREATED-QUESTLINE.md](../content/quests/HANDOFF-COCREATED-QUESTLINE.md))
asks for real forks written by the class: return the ink or use it, seal the door
or open it, spare the camp or kill it. Quest progress stored `status`,
`completedObjectiveIds`, and `rewardGranted`. There was nowhere to record which
path a Collegian took, so every quest had one completion paragraph and one reward.

The handoff offered two shapes: a new `choose` objective kind, or a `talk` whose
reply sets the outcome. Both add a decision point the engine has to arbitrate.

## Decision

- **An objective may carry an `outcome` id.** Finishing that objective ends the
  quest on that outcome. Objectives without one are the shared prefix every path
  walks. There is no `choose` verb and no new command.
- `QuestTemplate.outcomes` is two or more `{ id, completionNarration,
  itemRewardTemplateId? }`. A quest with `outcomes` may not also set a top-level
  `completionNarration` or `itemRewardTemplateId`; content validation refuses it,
  so a fork cannot silently pay twice.
- Content validation also refuses an objective naming an unknown outcome, and an
  outcome no objective can reach.
- **Completion needs every untagged objective plus exactly one tagged one.** The
  branch a Collegian did not walk is not unfinished work, and a later trigger on
  that branch does nothing.
- `experienceReward` stays one number for the whole quest, so the two paths cannot
  pay different experience and the fork is never a trap.
- `rewardGranted` remains the once-only guard.
- `QuestProgress.outcome` is persisted as nullable `outcome text` on
  `quest_progress` (migration `0015_quest_outcome.sql`). Old rows stay valid and
  read back as no outcome.
- A quest with no `outcomes` behaves exactly as before.

## Consequences

Authors get forks in JSON with no engine work per story. The cost is that a fork
must be expressible as "which thing did you do", not "which thing did you say" —
sealing Mist's door is `talk mist` again, opening it is `visit` plus `defeat`.

`createPlayState` may later project the chosen outcome so the client can show it.
The client must not invent one.

This does not add branching rewards beyond one item per outcome, a second
inventory, or any per-outcome experience difference. It does not change ADR-0040
slots or ADR-0043 once-per-fight help.
