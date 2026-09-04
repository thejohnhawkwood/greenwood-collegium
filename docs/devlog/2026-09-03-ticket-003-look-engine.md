# 2026-09-03 — Ticket 003 one-room look

## Intent

Prove `look` in the pure game engine with no web or database.

## Machine

Home desktop, branch `ticket-003-one-room-engine`.

## What changed

- Room, character, and in-memory world types
- `handleLook` returns a validated `room.snapshot`
- Tests use Lantern Court in memory and an injectable clock

## PRD / ADR

- PRD Appendix E Ticket 003
- ADR-0002 (engine emits events; transport comes later)

## Classroom note

Students can run one function, `handleLook`, and read the same Lantern Court paragraph without starting a server.

## Next

Ticket 004: Socket.IO delivers this event to a browser.

## Open questions

None. Movement and a second room wait for Ticket 006.
