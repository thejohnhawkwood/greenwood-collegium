# 2026-09-03 — Ticket 006 three-room movement

## Intent

Let a player walk among three rooms and be stopped by a missing exit.

## Machine

Home desktop, branch `ticket-006-three-room-movement`.

## What changed

- `handleMove` validates exits, updates location, records discovery, and sequences events
- In-memory Lantern Court, Great Hall, and West Cloister
- East from the court is listed but not open yet
- Socket gateway now dispatches look and movement

## PRD / ADR

- PRD Appendix E Ticket 006, section 10.4
- ADR-0002 (engine decides; transport delivers)

## Classroom note

`north` is a command. The engine checks the exit list, then writes a new room id. The page only prints the events.

## Next

Ticket 007: presence and `say`.

## Open questions

East Gate is named on the court but not loaded. That is intentional until later content work.
