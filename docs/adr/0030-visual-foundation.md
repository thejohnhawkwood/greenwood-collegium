# ADR-0030: Visual foundation and saved appearance

## Status

Accepted for Cycle A, September 15, 2026.

## Context

The owner selected Cycle A (S0–S2) from the Coding 9 Define and Solution Slices
handoff. The first slice establishes the play layout and recognisable saved
characters while keeping typed commands, complete narration and classroom controls.

## Decision

- A responsive play shell provides a paper doll, explored-room minimap with a compass below, server
  vitals, a central room view with visible entities, player shelf, speech log and unified room/story/action log and an anchored command input. On compact screens
  the panels stack inside a scrolling region; the command input remains outside it.
- Compass buttons immediately submit movement through the normal command pipeline,
  preserving the input draft. Entities and other shortcuts prepare typed commands. Neither React nor illustration code decides game outcomes.
- A versioned, validated appearance profile stores silhouette, palette, markings,
  expression, tunic and one accessory. Species stays on the existing character
  record. The profile is cosmetic: it cannot change combat or permissions.
- One deterministic SVG component renders creation, paper doll and player shelf.
  All 11 current species have distinct silhouettes/details. Unknown species use a
  labelled fallback; unavailable saved layers use fixed defaults. There are reserved
  class/equipment groups, but this slice does not pretend those layers are equipped.
- Migration `0008_character_appearance.sql` adds a non-null JSONB profile with a
  default for existing characters. Existing admission and names are unaffected.
  Teacher renaming preserves the saved profile. New creation requests may omit the
  profile for compatibility, but supplied profiles must validate strictly.
- `play-state` is a complete read model from a pure engine projection. The gateway
  sends it after durable mutations and ordered game events, on entry, reconnect and
  command replay. A replay projects the current world, rather than restoring an old
  visual room. It does not consume event sequence numbers or repeat narration.
- The projection exposes the current visible room and the viewer's actual vitals.
  Nearby players expose character IDs, names and appearance, never login/account
  identifiers, tokens or private stats. Cycle B charted-room fog is defined in
  [ADR-0031](0031-world-map-fog.md).
- Disconnects clear the visual state while preserving the local transcript. Invalid
  visual responses show a retry message and leave plain narration usable.
- The central illustration is a shared decorative academy frame. Current room
  title, description, entities and exits are server data. Distinct authored room art,
  persistent discovery, lobby chat and travel belong to subsequent slices.

## Consequences

No new dependency, remote portrait request or image generation service is needed.
Legacy characters receive a stable default; appearance is selected during creation,
not through a new post-approval editor. Health/focus/equipment retain their existing
engine persistence semantics; this migration persists cosmetics only.

Speech and story are independent scroll regions. Together they preserve all plain
event narration; the private six-month teacher record remains unchanged. The local
speech panel shows this browser session's nearby speech, not a realm-wide channel.

See [the Cycle A guide and acceptance checklist](../design-sprints/ds-002-visual-foundation.md).

## Owner follow-up: navigation and art

The minimap uses declarative room coordinates, filtered by the engine to discovered
rooms in the current zone. The current room is always included; unmapped rooms
have a text fallback. Discovery follows existing in-memory session semantics, not
new database persistence. Paths connect known rooms only; hidden contents and
unvisited room names are not exposed. Full room snapshots and actions share one
scrolling narration pane; nearby speech retains its independent log.

Collegian and room illustrations are the painted catalog in
[ADR-0032](0032-painted-catalog.md): checked-in PNG layers and room plates, no
runtime generator. Keep readable UI text and semantic colours separate from
painted artwork.
