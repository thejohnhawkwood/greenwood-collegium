# ADR-0026: Per-Collegian Arrival keys

## Status

Accepted

## Context

Arrival at the Collegium asks every student to `take key` in Lantern Court. Ticket 012 and [ADR-0016](0016-inventory-ownership.md) made that key one unique world instance. The first Collegian who takes it finishes the quest; everyone else hears that the key is gone.

A classroom of thirty students needs every person to finish Arrival. This is not yet a general unique-item spawn, destruction, or regeneration system.

## Decision

- A placement may set `starterPerCharacter: true`. That file is a recipe, not a shared world instance.
- The first `look`, `take`, `examine`, or join glance for a Collegian who does not already hold or own that template creates one personal instance in the placement room.
- Only that Collegian can see or take their copy. The moss-bound primer stays a single unique world item.
- Authenticated copies are inserted with the existing placement seed path, then claimed like any other take. An unclaimed leftover `item-copper-key-lantern-court` row from before this change is ignored. A held leftover row is kept so that student is not given a second key.

## Consequences

Two students can both `take key` and complete Arrival. We still do not destroy items, refresh rooms, or mint stackable copies. Later tickets own those systems.
