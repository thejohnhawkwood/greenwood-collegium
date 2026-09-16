# 2026-09-16 — Semantic colour close-out and lobby travel

## Intent
Confirm DS-001 colour was already in the transcript, close the missing SYSTEM
label, and ship S5 lobby travel along discovered paths.

## Machine
Desktop.

## What changed
- `[SYSTEM]` labels and `--text-system` for `system.notice` and map discovery.
  COMBAT, QUEST, ITEM, NPC, and PC labels were already live.
- Lobby desk after sign-in: Collegian portrait, last room, present peers, and
  visited destinations. Header **Lobby** returns there.
- `travel` / `journey` relocates along a discovered path. World map clicks on
  explored rooms send the same command. Fogged titles stay hidden.

## PRD / ADR
[ADR-0028](../adr/0028-semantic-transcript.md),
[ADR-0033](../adr/0033-lobby-travel.md),
[DS-001](../design-sprints/ds-001-classroom-readability.md),
[DS-005](../design-sprints/ds-005-lobby-travel.md).

## Classroom note
Open `/?shell=1`, enter play, then Lobby. On the live site type `travel great hall`
after visiting it, or click it on World map.

## Next
Human confirm the live Render deploy. Do not start another interface sprint
unless the owner names it.

## Open questions
Classroom readability still needs a student playtest before claiming an
improved scanning outcome.
