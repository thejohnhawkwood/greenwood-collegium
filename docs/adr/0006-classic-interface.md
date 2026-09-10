# ADR-0006: Classic interface retained

## Status

Superseded in part by [ADR-0028](0028-semantic-transcript.md), September 10, 2026.
The original decision below is historical. The owner removed the separate classic
UI requirement; typed commands, plain narration, and accessibility remain required.

## Context

The first playable interface is a typed-command transcript. Later design sprints add colour, HUD, panels, minimap, combat theatre, and glyphs. PRD section 11 forbids replacing the engine or retiring classic mode.

## Decision

- Typed commands remain the canonical player interaction.
- Classic mode must stay a complete way to play.
- Colour, motion, and panels are progressive enhancements.
- Essential information is never colour-only.
- Ticket 001 ships a non-playable placeholder page so the web package builds. Classic gameplay starts at Ticket 005.

## Consequences

Interface upgrades need a design-sprint record. Agents may not delete the classic renderer to “simplify” a later UI.
