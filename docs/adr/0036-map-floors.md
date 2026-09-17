# ADR-0036: Map floors and vertical travel

## Status

Accepted, 16 September 2026.

## Context

ADR-0031 charted the Collegium on one `{x,y}` plane. The High Study, Bell Stair,
Silk Gallery, Webbed Cloister, Cocoon Nave, and Deep Cradle stayed `unmapped` so
they would not collide with ground rooms. Students could not see those floors or
use the world map to go up or down.

## Decision

- Room `map` may include `z`. Omit it for the grounds (`0`). Unique coordinates
  are `{x,y,z}`. `up` must increase `z`; `down` must decrease `z`.
- `play-state` still lists every charted room. The compact minimap shows the
  current floor. The world map can change floors with Up and Down, and can send
  `up` / `down` when the current room has those exits.
- `unmapped` remains for later secrets, not for ordinary vertical rooms.

## Consequences

The silk below the Clock Tower and the High Study appear as their own charts.
Fog still hides unvisited titles. Silk rooms may reuse Clock Tower art through
`visualState`.
