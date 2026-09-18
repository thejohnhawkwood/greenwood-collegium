# 2026-09-17 — Spawn memory, spells, felt levels

## Intent
Keep first-time combat memory across a Render restart, then ship the small
enjoyment cluster students already asked for.

## Machine
Desktop.

## What changed
- Persist `defeated_spawn_ids` on the Collegian (migration 0012).
- `spells` / `grimoire` lists Ember and the School kit.
- Year-marks raise max health and focus. Stats prints both.
- Investigation and silk quests award one personal pack item.
- Punch edge-connected paper white from silk and scrap plates.

## PRD / ADR
[ADR-0037](../adr/0037-first-time-spawns.md), Ticket 015 rewards, PRD Appendix A `spells`.

## Classroom note
After a deploy, a student who already stood at the dummy does not get the
first-timer lesson twice. Type spells. Finish a quest and look in the bag.

## Next
Play dummy, a consented duel, and the queen on the live site.

## Open questions
Shop, craft, and opt-in fight join stay later. Do not add Strength.
