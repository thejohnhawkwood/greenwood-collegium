# ADR-0018: Ember results are decided before presentation

## Status

Accepted

## Context

Ticket 014 must teach Ember through the classic transcript. Later clients may animate `ember-burst`. Animation must never decide damage, burning, or legality.

## Decision

- Ember is a declarative spell template in `packages/content/spells`.
- `handleCast` spends focus, applies fire damage, and applies burning in the engine.
- The Ember event carries `presentationKey: ember-burst` plus narration and semantic segments.
- Classic rendering uses `narration` only. The presentation key is optional decoration.

## Consequences

`cast ember dummy` is fully explained as plain text. Colour, HUD, and glyph animation remain later design sprints.
