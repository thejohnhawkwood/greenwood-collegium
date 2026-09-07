# ADR-0019: Quest rewards are awarded once and persisted as totals

## Status

Accepted

## Context

Ticket 015 must finish Arrival at the Collegium, grant experience, and reach Level 2. Repeating `look` or reconnecting must not grant the reward again. Authenticated progress must survive refresh.

## Decision

- Arrival is a declarative quest template. The engine interprets objective kinds; JSON is not executable script.
- Join auto-look does not complete the look objective. Only a player-issued `look` does.
- Completing the last objective sets `rewardGranted` and writes an absolute experience and level total.
- Persistence stores that total and the quest row. A second write of the same totals is a no-op, not an increment.

## Consequences

Guests keep Arrival in memory for one connection. Signed-in characters retain Arrival, experience, and level. Later quests can reuse the same progress table.
