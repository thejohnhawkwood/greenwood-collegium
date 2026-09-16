# 2026-09-16 — Conversation stage, command assistance, bag

## Intent
Put talk choices on the room painting, jump the story log after a visual
action, finish classic DS-003 command assistance, and add the DS-004 bag.

## Machine
Desktop.

## What changed
- Play-state now projects an open conversation and carried items.
- Choice buttons on the room painting send `say 1` / `say 2`. The story log
  jumps to the result after any sent command; unsolicited speech still keeps
  a New messages button if you were reading history.
- Tab completes the current word. A reminder strip lists legal verbs and open
  replies. Look, Help, Inventory, and Quests send instead of only filling the
  input.
- Inventory opens a bag panel grouped as in-hand and carried. Examine, Equip,
  and Drop send the matching typed commands.

## PRD / ADR
[PRD 12.5–12.6](../PRD.md), [ADR-0030](../adr/0030-visual-foundation.md).

## Classroom note
Open `/?shell=1`, dismiss the lobby, and click a Porter reply. Then click
Inventory.

## Next
Human confirm the live Render deploy: talk, a choice button, Tab, and the bag.

## Open questions
Shortcut settings from the DS-003 list are still deferred. DS-005 quest
tracker is not started.
