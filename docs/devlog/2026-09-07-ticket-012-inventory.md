# 2026-09-07 — Ticket 012 inventory vertical slice

## Intent

Let students take, drop, and examine unique items without two people owning the same key.

## Machine

Home desktop, branch `ticket-012-inventory`.

## What changed

- Item templates and placements in `packages/content`
- Engine take, drop, examine, and inventory
- Conditional ownership claim in memory and Postgres
- Look shows ground items

## PRD / ADR

- PRD Appendix E Ticket 012, 10.6, 16.5–16.6, 17.2
- ADR-0016

## Classroom note

If two hands reach for the same key, only one keeps it.

## Next

Ticket 013: combat vertical slice.

## Open questions

Stackables, capacity, use, and equipment are later. Guests do not persist inventory.
