# 2026-09-07 — Per-Collegian Arrival key

## Intent

Let every student `take key` and finish Arrival without building item destruction or regeneration.

## Machine

Home desktop, branch `per-collegian-copper-key`.

## What changed

- Copper key placement is `starterPerCharacter`
- Engine mints one personal copy on first look, take, examine, or join glance
- Authenticated copies persist before claim
- Primer uniqueness is unchanged

## PRD / ADR

- [ADR-0016](../adr/0016-inventory-ownership.md)
- [ADR-0026](../adr/0026-per-collegian-starter-items.md)

## Classroom note

Two hands can both take a key. They do not see each other's copy.

## Next

Preserve a public copy branch after this lands on `main`. Class iteration stays on `class-2026-09-08`.

## Open questions

Live Arrival still needs two signed-in students after deploy. Unit tests do not prove Render.
