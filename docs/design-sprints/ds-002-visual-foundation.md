# Cycle A: visual foundation (S0–S2)

The owner selected this scope on September 15, 2026, using the Coding 9 MUD
Define and Solution Slices Handoff v2. This is one implementation cycle; it does
not implement the complete roadmap.

## Design language

Dark woodland surfaces, restrained brass borders and warm serif headings frame
the game. Smaller interface text uses system sans-serif; the command line stays
monospaced. Existing semantic meaning is retained: narration light grey, objects
green, NPCs blue, players cyan, combat red and quests gold. Text labels distinguish
NPCs, objects, players and combat, so colour is not the only cue.

Focus uses a clear gold outline. Buttons have hover, disabled and focus states.
Connecting, empty speech, malformed state and failed creation requests have readable
messages. The layout uses local fonts and checked-in paintings; no third-party
asset service is required. Room plates and Collegian layers are defined in
[the painted catalog bible](ds-004-painted-catalog.md).

## Player guide

1. Create a Collegian using the existing classroom invite/sign-in flow. Choose a
   species, name and appearance. The live preview uses the same rendering as play.
   Students still wait for teacher name approval before entering.
2. Your left panel shows your saved appearance. Health and focus overlay the
   bottom of the Collegian frame. Name, level and XP sit under the frame.
   Equipped item text comes from the server.
3. The minimap shows explored rooms in the current zone with a ring marking you.
   The compass below it moves immediately when clicked, preserving your input draft.
   Discovery is saved with your Collegian after Cycle B.
4. Click a person or object on the room painting to zoom its full plate to
   Collegian-portrait size and open Examine / Talk. Inventory, Quests, Help and
   Look still prepare typed commands. Typed commands remain available throughout.
5. Around you & story combines full room descriptions and action narration in one log.
   Room speech keeps nearby `say` messages from this session, including previous
   rooms. Scrolling up in either log preserves your position as new lines arrive;
   use New messages to return to the latest line.
6. On narrower screens, scroll the panels while the command input stays visible.
   Keyboard users can use Skip to command and tab into each reading region.

Teacher controls remain on the right on wide screens, and below the play screen
on narrow screens. The six-month speech record, exports, approval and moderation
remain the existing staff-only workflow. No student identifying data is added.

## Developer / authoring guide

- Appearance contract: `packages/contracts/src/appearance.ts`. Allowed values are
  enums; custom URLs, arbitrary SVG and extra fields are rejected. Add new versions
  intentionally with migration/fallback coverage.
- Renderer: `apps/web/src/app/CharacterPortrait.tsx`; accessible description:
  `appearance-description.ts`; choice controls: `AppearanceEditor.tsx`. Use the same
  renderer for future lobby portraits. Do not introduce separate random avatars.
- Persistence: migration 0008 and character repositories. Both memory and Postgres
  tests cover save/read, replacement, legacy defaults and rename preservation.
- Read model: `packages/game-engine/src/play-state.ts` and the `play-state` contract.
  Server coordination emits it on the existing authenticated socket, after game
  events. Keep game calculations and visibility filtering in the engine.
- Layout: `PlayPanels.tsx`, `RoomScene.tsx`, `styles/play.css`. The shared scene is
  decorative; visible text and prepared commands come from validated server state.
  Authored rooms/NPCs/quests remain the existing declarative content. This slice
  adds no rooms or gameplay rules.
- Run migrations before running the new server against an existing database.
  Never point verification at production or use a production dump. Rollback can
  leave the additive appearance column in place; older code ignores it.

## Acceptance and evidence

Automated coverage includes strict profile validation, deterministic rendering of
all species, text fallback, readable status values, independent named logs, private
data filtering, appearance persistence, HTTP save/new login, multiplayer presence,
movement and reconnect/replay. Existing scroll and 30-client load tests remain in
the required suite.

Browser checks use fictional local accounts. Classroom usability evidence is
still pending: do not report a student recognition percentage or task completion
time as measured until students actually test it.

Implementation verification (September 15, 2026): all 259 tests passed with a
dedicated local PostgreSQL 18 instance, including the 30-client simulation. An
upgrade from migrations 0000–0007 to 0008 backfilled an existing fictional
character's appearance, preserved its name/location/XP, and reran safely. Browser
checks covered 1440 × 900, 1280 × 720 and 390 × 844 layouts, creation/save/reload,
explicit command preparation, room movement, teacher controls and speech arriving
while reading earlier messages. No production data was used.

For the next classroom check, ask students to:

- Create an appearance, re-enter, and identify their matching paper doll and avatar.
- Find current health, read the room, examine something and move using the compass or a typed
  command without losing the command input.
- Scroll old speech while a classmate speaks; verify the view stays still and the
  jump button returns them to new messages.
- Repeat on the school's narrowest display and using only the keyboard.

Record anonymised counts and observations outside student-identifying records.
The handoff's 95% recognition target is a playtest target, not a claimed result.

Deferred after Cycle A: persistent exploration map, realm lobby, player travel,
room-specific art, class selection, equipment art, new mobs, quests and group
combat (Cycles B–D). Cycle B later added the persisted world map; see
[ds-003](ds-003-world-map.md) and [ADR-0031](../adr/0031-world-map-fog.md).
Lobby travel remains deferred.

Future art direction: retain the current placeholders until original painted woodland
assets are authored. Use digital watercolor/gouache, soft natural light and expressive
animal Collegians, with Gwelf and Beatrix Potter as atmosphere references. Match the
existing academy art; see ADR-0030 for the owner follow-up.

Navigation follow-up verification: 251 tests passed; nine PostgreSQL tests were
skipped in this run because the dedicated database was stopped (the original
Cycle A database verification above remains separate). Typecheck, lint and build
passed. Browser checks at 1280 × 720 and 390 × 844 confirmed immediate compass
movement, preserved command drafts, north-up discovery updates, and the unified
narration pane. No new database schema or persistence behavior was added.
