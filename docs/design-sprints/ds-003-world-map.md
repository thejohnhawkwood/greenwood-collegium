# Cycle B: world map and fog of war (S4)

This slice follows Cycle A. Lobby travel is [DS-005](ds-005-lobby-travel.md).
Painted room, NPC, and object plates live in [DS-004](ds-004-painted-catalog.md).

## Player guide

The left minimap now shows the whole charted Collegium. A ring marks you.
Explored rooms are solid cells. Fogged rooms are hatched and unnamed. Open
**World map** or type `map` (or `chart`) for the larger chart and a text list.
The command names only rooms you have already visited and how many remain in
fog. Compass clicks still move immediately. A neighbouring explored room on the
world map prepares `go <direction>`.

Discovery is saved with your Collegian. It returns after sign-in and reconnect.

## Developer / authoring guide

- Place every ordinary room with unique `map: {x,y}`. Keep `unmapped` for later
  secrets. Cardinal exits must increase or decrease the matching axis.
- `createPlayState` emits every charted room. Fogged rooms omit `title`.
- Persist `discovered_room_ids` through migration 0009 and the character
  repositories. Hydrate it on join.
- The compact minimap and World map panel share `Minimap.tsx`.

## Deferred

Class and equipment layers, and classroom playtest percentages.
