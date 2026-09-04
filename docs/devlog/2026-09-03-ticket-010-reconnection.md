# 2026-09-03 — Ticket 010 reconnection and idempotency

## Intent

Stop refresh and repeated network delivery from applying the same move twice.

## Machine

Home desktop, branch `ticket-010-reconnection-idempotency`.

## What changed

- In-memory command log keyed by command id
- Authenticated disconnect grace and `session.snapshot` resume
- Client ignores already-applied sequences and retries an unacked command

## PRD / ADR

- PRD Appendix E Ticket 010, 16.6, 23.3
- ADR-0014

## Classroom note

A command id is a receipt. If the same receipt comes back, the school does not walk you down the hall a second time.

## Next

Ticket 011: content loader.

## Open questions

Guests still leave immediately. Rewards do not exist yet; they should use the same command id when they do.
