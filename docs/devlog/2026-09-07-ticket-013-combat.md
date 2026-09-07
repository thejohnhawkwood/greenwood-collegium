# 2026-09-07 — Ticket 013 combat vertical slice

## Intent

Let a student finish one complete, non-graphic fight through the classic interface.

## Machine

Home desktop, branch `ticket-013-combat`.

## What changed

- Practice Dummy enemy content in South Orchard
- Engine encounter, attack, enemy reply, victory XP, infirmary defeat
- Injectable random source for deterministic damage
- Socket dispatch for `attack`

## PRD / ADR

- PRD Appendix E Ticket 013, 10.7
- ADR-0017

## Classroom note

`south` then `attack dummy` starts a lesson. Losing wakes you in the Infirmary with your things.

## Next

Ticket 014: spell and Ember event.

## Open questions

Spells, focus, persistable health, and XP hydration are later. Guests lose combat state on process restart.
