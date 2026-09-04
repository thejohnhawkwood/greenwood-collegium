# 2026-09-04 — Ticket 011 content loader

## Intent

Load a twenty-five-room academy from JSON so a new room does not require a TypeScript change.

## Machine

Home desktop, branch `ticket-011-content-loader`.

## What changed

- Room files and JSON Schema in `packages/content`
- Validation for ids, exits, reachability, coordinates, and plain text
- Server start and package build fail when content is invalid
- `/health/ready` can report ready when the database pings and rooms load

## PRD / ADR

- PRD Appendix E Ticket 011 and section 19
- ADR-0007, ADR-0015

## Classroom note

A room is a file. If the file is wrong, the school does not open.

## Next

Ticket 012: inventory vertical slice.

## Open questions

Item, NPC, quest, and spell catalogs are still later tickets. West Cloister stays east-only so the existing three-room walk still rejects south.
