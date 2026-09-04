# 2026-09-03 — Ticket 002 event contract

## Intent

Define the shared event envelope and prove one `room.snapshot` validates and renders to classic text.

## Machine

Home desktop, branch `ticket-002-event-contract`.

## What changed

- Zod envelope, semantic segments, and `room.snapshot` payload
- Lantern Court fixture from the PRD sample
- Classic narration renderer plus segment concatenation check

## PRD / ADR

- PRD section 16, Appendix E Ticket 002
- ADR-0002

## Classroom note

Students can open one JSON-shaped event and see both a structured payload and the exact paragraph a classic client would print.

## Next

Ticket 003: pure `look` in `packages/game-engine`.

## Open questions

None for this slice. Other event payloads wait for their tickets.
