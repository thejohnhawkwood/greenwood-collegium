# Cycle C: lobby travel (S5)

## Status
Implemented. Owner: Philip Bird.

## Player guide

After you sign in, the Collegium lobby shows your Collegian, the room you last
stood in, other signed-in Collegians, and rooms you have already visited.
**Enter the Collegium** returns you to play. A destination button, a World map
click, or `travel Library Stacks` follows known paths to that room. Fogged names
stay hidden. Speech still reaches whoever shares your current room.

## Developer / authoring guide

- `travel` / `journey` parse in the engine. The destination must be mapped and
  discovered, and a path of discovered rooms must exist. Combat blocks travel.
- Presence notices fire at the origin and destination only. Intermediate rooms
  do not see a passer-by.
- `play-state.peers` lists other connected characters. `roomTitle` is omitted
  when the viewer has not discovered that room.
- The lobby is a UI desk, not a new content room.

## Deferred

Class and equipment layers, realm-wide chat, classroom playtest percentages.
