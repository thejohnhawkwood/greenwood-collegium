# ADR-0016: Unique item ownership

## Status

Accepted

## Context

Ticket 012 must stop two students from taking the same unique item. Inventory ownership is a critical mutation. The engine is in-memory. Authenticated characters persist to Postgres.

## Decision

- Item templates and starting placements are declarative JSON in `packages/content`.
- Unique item instances have one location: a room or one character.
- The engine mutates ownership first. Authenticated takes then persist with a conditional claim (`holder` is null and `room` matches). A failed claim reverts the in-memory item.
- Guests keep inventory in process memory only. Guest character ids are not character rows.

## Consequences

A second take of the same unique instance still fails. The Arrival copper key is a classroom exception: each Collegian receives a personal copy ([ADR-0026](0026-per-collegian-starter-items.md)). The moss-bound primer remains one world instance. Restart restores authenticated ownership from `item_instances`. Stackable items, destruction, and regeneration remain later tickets.
