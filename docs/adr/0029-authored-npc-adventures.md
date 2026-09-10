# ADR-0029: Authored NPC conversations and investigation quests

## Status

Accepted for the September 10 owner-requested content pass.

## Context

The owner requested more life, interactions, and a few quests within the existing
rooms. Arrival already provides persisted per-character objectives and one-time
experience rewards. A classroom needs discoveries that remain available when
many students follow the same route.

## Decision

NPC fixtures may declare a plain-text `dialogue`. The pure engine handles
`talk <name>` and `talk to <name>` by resolving a speaking NPC in the character's
current room. Conversations produce character-only events with an NPC semantic
name segment and complete plain narration. There is no generated dialogue.

Quest files may declare `giverNpcId` and `completionNarration`. Talking to the giver
starts a quest once. New `examine` and `talk` objectives resolve a fixture's stable
ID; successful examination supplies the engine-resolved target to the quest
tracker. Failed commands and client-provided target IDs cannot grant progress.
Optional `requires` lists reference earlier objective IDs. A report objective
requires every clue, while the clues themselves can be investigated in any order.

The server persists talk and examine progress before acknowledging the command,
using the existing absolute experience totals and quest records from ADR-0019.
Replay uses existing event IDs. A completed quest cannot award another reward on
a later conversation or after loading its saved record.

All new clues are permanent room fixtures, avoiding shared-item contention.
Quests record personal observations, not global removal or transformation of
objects. Authenticated players keep progress; guest sessions remain temporary.

The JSON schema additions are optional and backwards compatible. Existing Arrival
JSON and stored progress require no migration; no relational schema changes or new
dependencies are introduced. All 25 room IDs, exits, and map placements remain intact.

## Consequences

Future dialogue and investigation content can be added entirely in JSON. This
slice provides one authored conversation per NPC, clue discovery, reminders,
turn-in dependencies, and a conclusion. Branching choices, NPC movement, item
handover, repeatable rewards, healing interactions, and quest-driven global world
changes remain future work. Published quest and objective IDs must remain stable
unless an explicit progress migration is supplied.

See [the adventure guide](../content/adventures.md) for commands, quest routes,
authoring constraints, and validation.
