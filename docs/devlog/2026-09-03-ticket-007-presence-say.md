# 2026-09-03 — Ticket 007 presence and say

## Intent

Let two sessions see one another in a room and share `say`.

## Machine

Home desktop, branch `ticket-007-presence-say`.

## What changed

- One unused in-memory character per socket (ADR-0011)
- `handleSay`, join, and leave in the engine
- Entry and exit notices to occupants
- Chat rate limit: five says per ten seconds
- Two-client socket test

## PRD / ADR

- PRD Appendix E Ticket 007, section 10.5
- ADR-0011

## Classroom note

Open two tabs. Type `look`. You should see another woodland student. Type `say hello`. The other tab prints the line. Chat is still plain text.

## Next

Ticket 008: PostgreSQL and Drizzle.

## Open questions

The four-character guest pool goes away when Ticket 009 adds accounts.
