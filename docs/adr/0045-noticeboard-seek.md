# ADR-0045: The Lantern Court noticeboard can send you to a giver

## Status

Accepted, September 23, 2026.

## Context

Lantern Court’s noticeboard was an examine paragraph. Students still had to
remember who waited where. [ADR-0033](0033-lobby-travel.md) keeps ordinary
`travel` on discovered paths.

## Decision

- While you stand in a room with the noticeboard, `play-state.noticeboard`
  lists offered and active quests the server will name. Finished work leaves
  the board. A quest with unmet `requiresQuestIds` stays off it.
- A giver’s post points at that NPC’s room. An active quest with no giver
  points at the current step’s room. The client renders those posts and sends
  the projected `seek` command. It does not invent a destination.
- `seek <name>` moves you to that posted room and discovers it. Rooms between
  here and there stay fogged. Combat blocks it. `seek` away from the board is
  refused. Ordinary `travel` is unchanged.

## Consequences

A student can open the board in Lantern Court and go to a named giver without
walking the path first. The map learns that room only.
