# ADR-0015: File-per-room content loader

## Status

Accepted

## Context

Ticket 011 must load a twenty-five-room academy from data. Students should be able to add a room without editing TypeScript. Invalid content must not start.

## Decision

- Each room is one JSON file in `packages/content/rooms`. The file name matches the stable kebab-case id.
- Authors declare either integer `map` coordinates or `unmapped`.
- Validation rejects duplicate ids, missing exit targets, unreachable rooms, illegal HTML, and missing start room `lantern-court`.
- Reciprocal exits are allowed to be one-way.
- The server maps validated rooms into engine `WorldState`. The process exits on validation failure. `/health/ready` may report ready when the database pings and this load succeeds.

## Consequences

A new room is a JSON file plus validation. Ticket 012+ can add item and NPC catalogs without changing the room file rule.
