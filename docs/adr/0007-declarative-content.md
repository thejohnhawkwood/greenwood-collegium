# ADR-0007: Declarative JSON world content

## Status

Accepted

## Context

Students should be able to contribute rooms and items without writing server code. Executable user content is a safety and review risk.

## Decision

World content (rooms, exits, items, NPCs, spells, quests, help) lives as declarative JSON validated against schemas. `packages/content` is the home for that data. Ticket 001 creates the package boundary only.

Content validation is a required command (`pnpm --filter @greenwood/content validate`). Invalid content must fail the build or start, not load silently.

## Consequences

Student room work can be reviewed as a diff of data. Quest logic is a state machine in data plus engine rules, not arbitrary scripts.
