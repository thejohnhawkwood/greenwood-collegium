# 2026-09-07 — Ticket 015 Arrival and teacher playthrough

## Intent

Let a new character finish Arrival at the Collegium, hear Porter Bramble name the first words, keep the reward once, and give the teacher a bootstrap path plus a classroom playthrough.

## Machine

Home desktop, branch `ticket-015-arrival`.

## What changed

- Declarative Arrival quest and Porter intro
- Engine `help`, `quests`, one-time XP and Level 2
- Quest progress persistence
- Clearer owner bootstrap copy and `playthrough.md`

## PRD / ADR

- PRD Appendix E Ticket 015, section 10.11, quest 1
- ADR-0019

## Classroom note

Type `look`, `say hello`, `take key`, then `north`. `help` lists the words. Signed-in students keep the quest after refresh.

## Next

Ticket 016: teacher controls and moderation.

## Open questions

Later quests can reuse the same table. Combat XP now persists for signed-in characters; focus and health remain in-memory.
