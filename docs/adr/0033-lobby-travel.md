# ADR-0033: Lobby travel along discovered paths

## Status

Accepted for Cycle C (S5), September 16, 2026.

## Context

Cycle B exposed the Collegium chart with fog. Students still had to walk every
exit. The visual-first handoff deferred a lobby and player travel.

## Decision

- A lobby desk shows the saved Collegian, last room, present peers, and
  discovered destinations. It does not add a content room or a realm-wide chat.
- `travel <place>` (alias `journey`) relocates a Collegian along a BFS path of
  rooms they have already discovered. Fogged titles never match. Combat blocks
  travel. The world map sends the same command for explored rooms.
- Peer location titles follow the same fog rule as the map.

## Consequences

Students can return to known classrooms without re-walking every corridor.
Unvisited names remain hidden. Typed commands stay canonical.
