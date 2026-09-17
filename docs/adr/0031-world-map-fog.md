# ADR-0031: Canonical world map with fog of war

## Status

Accepted for Cycle B (S4), September 15, 2026.

## Context

Cycle A projected only discovered, same-zone rooms that already had coordinates.
Twenty of twenty-five rooms were `unmapped`, so the minimap could not show a
Collegium chart. ADR-0030 also withheld a whole-world catalogue from the client.

The owner asked for a fog-of-war map of all rooms and a student-accessible world
map. That requires a canonical graph and a different visibility rule.

## Decision

- Every current Collegium room receives unique `map: {x,y}` coordinates. Authored
  `+y` is north. Cardinal exits must move on the matching axis; distance may be
  greater than one so branches do not collide. [ADR-0036](0036-map-floors.md)
  adds optional `z` so upper and lower floors do not collide with the grounds.
  `unmapped` remains for later secret rooms, which stay absent until discovered.
- `play-state` includes every charted room and path. Fogged rooms have `id`,
  coordinates and `state: "unknown"`. They never include a title or contents.
- Discovery is persisted on the character (`discovered_room_ids`, migration 0009)
  and restored on join, reconnect and replay.
- Students get the same projection in the compact minimap and a World map panel,
  plus a `map` / `chart` command that names only explored rooms.

## Consequences

The client can see the shape of the Collegium before visiting every room. It
cannot read unvisited titles, fixtures, mobs or quests from the map. Zone is not
a filter. This supersedes the ADR-0030 rule that forbade a whole-world catalogue;
unvisited titles remain forbidden.

See [the Cycle B map notes](../design-sprints/ds-003-world-map.md).
