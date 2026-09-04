# 2026-09-03 — Ticket 005 classic client

## Intent

Make UI 0 usable in one room: typed commands, a transcript, connection status, and history.

## Machine

Home desktop, branch `ticket-005-classic-client`.

## What changed

- Classic transcript renders server narration as plain text
- Command input with keyboard focus and up/down history
- Connection indicator
- Look button from Ticket 004 removed; type `look` instead

## PRD / ADR

- PRD Appendix E Ticket 005, UI 0 in section 12.1
- ADR-0006

## Classroom note

Type a command, see the request in the transcript, then the server’s paragraph. The engine still decides the room.

## Next

Ticket 006: three-room movement.

## Open questions

None for UI 0. Colour and completion wait for later design sprints.
