# ADR-0017: Server-authoritative combat in the engine

## Status

Accepted

## Context

Ticket 013 must run one complete fight through the classic interface. Combat calculations cannot live in React or Socket.IO. Tests must be deterministic. Classroom defeat must not be harsh.

## Decision

- Enemy templates and placements are declarative JSON in `packages/content`.
- `handleAttack` starts an encounter, enforces turn order, applies an injectable random roll to damage, and emits combat events with narration.
- One spawn may be in one encounter at a time. Students cannot fight each other.
- Victory awards experience once for that encounter. Defeat restores health, keeps inventory, and returns the character to the Infirmary.
- Guests keep combat in process memory. Authenticated defeat persists the Infirmary room.

## Consequences

A student can type `south` and `attack dummy` and finish a lesson in plain text. Spells, focus, and Ember remain Ticket 014.
