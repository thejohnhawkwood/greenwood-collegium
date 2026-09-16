# Cursor handoff: visual foundation and navigation

Updated September 16, 2026. Cycles A–B and the painted catalog are on `main`.
This is a continuation brief, not authorization to start DS-001 colour or lobby
travel.

## Start here

The play shell now uses painted rooms, Collegian looks, unique NPC plates, and
unique object plates. Clicking an NPC or object zooms the full punched artwork
to Collegian-portrait size in the top-left of the room painting. Health and
Focus overlay the Collegian frame. Minimap and NESW stay visible on desktop.

**Shipped on `main` through `6619f08` plus the current plate-zoom pass.** Render
deploys `main` to https://greenwood-collegium.onrender.com.

- Repository: the `greenwood-collegium` folder in this workspace
- Remote: `https://github.com/thejohnhawkwood/greenwood-collegium.git`
- Local preview: `http://127.0.0.1:5173/?shell=1`
- Runtime: Node (Cursor helper), TypeScript strict, React/Vite, Fastify/Socket.IO,
  pure game engine, Zod contracts, PostgreSQL/Drizzle, Render hosting.

Read root and relevant package `AGENTS.md`, `docs/PRD.md`,
`docs/adr/0030-visual-foundation.md`, and
`docs/design-sprints/ds-002-visual-foundation.md` before editing. ADR-0027 covers
moderation, ADR-0028 semantic narration, and ADR-0029 authored adventures.
Some older context still describes a text-only UI; the owner amendments and
ADR-0030 supersede that older scope. Full plain-text narration and typed commands
remain required. No separate classic UI is needed.

## Budget and scope

The owner reported **$8.24 remaining** and asked to conserve it while preparing
this handoff. That was a user-reported balance, not a measured current balance.
Do not translate it into a guaranteed token count or promise a remaining dollar
amount. Begin with a small status/diff check and the focused files below. Avoid
rebuilding context, broad web research, new dependencies, image generation,
parallel agents, repeated full-suite runs, or implementing Cycles B–D unasked.

The latest request authorized this document only. Do not infer a new commit,
push, merge, deployment, reset, or asset-generation request from the handoff.
Once the owner requests the next action, complete that specific action within
repository rules. Production deployment is human-controlled; do not merge your
own PR. Include AI disclosure in a PR description.

## What is implemented

### Play screen

- Left: saved Collegian portrait with Health/Focus overlaid at the bottom of
  the frame; name, level/XP under the frame; equipment caption; inventory/quest
  shortcuts; explored-room minimap; NESW compass. Fog legend lives on World map.
- Centre: painted room plate, server room title/summary, clickable NPC/object/
  Collegian tokens on the painting (click zooms the full plate), one
  **Around you & story** log.
- Right: independent nearby speech log; existing teacher controls remain on the
  right at wide sizes and below the play area at narrow sizes.
- Command input stays outside the scrolling panel region. Both logs preserve a
  reader's scroll position and retain the existing jump-to-latest control.
- Full `room.snapshot` narration supplies the combined log. The redundant
  persistent description pane was removed; narration was not shortened.
- Compass clicks immediately call the same `sendCommand` path as typed commands,
  append command history/transcript, and preserve an unfinished input draft.
  The server still validates movement. Other shortcuts prepare commands for Send.
- Disconnect clears stale visual state but retains the transcript; invalid visual
  payloads produce a readable notice rather than invented state.

### Saved appearance

- One deterministic SVG renderer serves creation, paper doll and nearby avatars.
  Eleven species have distinct silhouettes/details: mouse, hare, badger, otter,
  squirrel, mole, hedgehog, fox, stoat, owl and toad.
- Version 1 profile: build, palette, marking, face, clothing and accessory.
  Values are constrained enums, not arbitrary SVG, URLs or free text.
- Default: rounded/chestnut/plain/bright/fern/none. Read-side fallback tolerates
  unavailable layers; invalid submitted profiles are rejected. Unknown species
  have a labelled fallback.
- Creation shows a live preview. Existing approval workflow remains intact;
  teacher renaming preserves appearance. No post-approval appearance editor added.
- Migration `drizzle/0008_character_appearance.sql` adds a non-null JSONB
  `characters.appearance` column with the default profile. Journal is updated.
  Memory and PostgreSQL repositories carry the profile through auth and play.

### Authoritative visual state and map

- Contract `play-state` contains private self stats/appearance, current visible
  room and minimap. Nearby players expose public character identity/appearance,
  not account names, invite tokens or private stats.
- Pure engine `createPlayState` projects current world state without mutating it.
  Gateway emits after persisted events and on entry, reconnect and replay.
  Visual state does not consume narration event sequence numbers. Replaying an
  old command projects the current room, not a stale cached visual room.
- Existing declarative `map: {x,y}` coordinates now survive content loading.
  The engine filters map nodes to discovered mapped rooms in the current zone,
  including the current room when mapped. Paths only connect included nodes.
  No whole-world catalogue or unvisited room titles reach the UI.
- Authored positive Y points north; `Minimap.tsx` negates Y for SVG rendering.
  Current location has a ring; an expandable text list supports accessibility.
- Discovery uses existing in-memory character state. **It is not persisted across
  fresh sessions/server restarts.** An unmapped room has no position marker;
  an empty map has a text fallback. Compass exits still come from current room data.

### Art direction

Painted Collegian looks, twenty-five room plates, NPC plates, and object plates
are checked in. Punch magenta from new plates with `tools/punch-plate-magenta.py`.
Preserve saved appearance consistency and readable semantic UI text. Gwelf and
Beatrix Potter are atmosphere only.

## Focused file map

- UI composition, command submission: `apps/web/src/app/App.tsx`, `PlayPanels.tsx`.
- Map/scene/portraits: `Minimap.tsx`, `RoomScene.tsx`, `CharacterPortrait.tsx`,
  `PresenceAvatars.tsx`, `npc-plates.ts`, `object-plates.ts`,
  `appearance-description.ts` in the same directory.
- Creation: `CharacterGate.tsx`, `AppearanceEditor.tsx`.
- Layout/scroll integration: `apps/web/src/styles/play.css`,
  `apps/web/src/app/academy-frame.tsx`, `GameTranscript.tsx`, `command-focus.ts`,
  and `apps/web/src/main.tsx`.
- Shared validation: `packages/contracts/src/appearance.ts`, `play-state.ts`,
  `auth/schemas.ts`, `events/room-snapshot.ts`, `index.ts`.
- Projection/public appearance: `packages/game-engine/src/play-state.ts`,
  `look.ts`, `presence.ts`, `state.ts`, `index.ts`.
- Map loading: `packages/content/src/world.ts`.
- Auth/persistence: `apps/server/src/auth/service.ts`, `http/auth.ts`,
  `persistence/{types,schema,memory,postgres}.ts`, migration 0008 and its journal.
- Delivery: `apps/server/src/sockets/gateway.ts`.
- Tests: web `visual-foundation.test.ts`; contracts `appearance.test.ts`;
  engine `play-state.test.ts`; content `load.test.ts`; server `http/auth.test.ts`,
  `persistence/persist.contract.ts`, `sockets/visual.roundtrip.test.ts`.
- Documentation: PRD amendment, ADR index/0030, DS-002 guide and this handoff.

Many new implementation files are **untracked**. A normal `git diff` alone omits
them: use `git status --short` and inspect their contents before staging.

## Preserve unrelated owner work

These files were already dirty before Cycle A. Do not overwrite, revert, or
silently include them in a code commit:

- `docs/classroom/README.md`
- `docs/classroom/class-day.md`
- `docs/context/CURRENT.md`
- `docs/classroom/design-sprint-lesson.md` (untracked)
- `docs/classroom/gemini-design-sprint-handoff.md` (untracked)

Use explicit staging paths; avoid `git add .`. Do not clean the entire worktree.
No secrets, `.env`, production data, real chat or student-identifying files may
be read, logged or committed. Teacher/student reference mappings stay external.
No reset or account deletion is needed for this release.

## Verification already completed

**Original Cycle A:** 259 tests passed with dedicated local PostgreSQL 18,
including the 30-client load simulation. A fictional existing character survived
the migration from 0000–0007 to 0008 with name/location/XP preserved and default
appearance backfilled. Re-running the migration runner succeeded. Typecheck,
lint, build and diff whitespace check passed.

**Latest navigation follow-up:** 251 tests passed, nine PostgreSQL tests skipped
because that local database was stopped; one new web test brings the total suite
to 260. Typecheck, lint, build and `git diff --check` passed. The skip is not a
database regression result. No persistence changes were made in the follow-up.

Automated coverage includes profiles, public/private projection, presence,
movement, replay/reconnect, discovery filtering, coordinate loading, north-up
rendering, fallback maps, unified narration and existing transcript scrolling.
Browser checks used fictional local accounts/guests: immediate compass movement,
preserved draft, map discovery, combined narration and layouts at 1280×720 and
390×844. Earlier Cycle A checks also covered 1440×900, creation/save/reload,
teacher controls and new speech while reading old messages. No measured classroom
usability claims should be inferred from these checks.

Run after meaningful changes, rather than repeatedly without changes:

```powershell
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm build
git diff --check
```

If deployment readiness requires the database tests, use only a dedicated test
database through `GREENWOOD_TEST_DATABASE_URL`; tests may clear its contents.
The previous synthetic cluster is `%TEMP%\greenwood-cycle-a-pg\data`, stopped,
port 55440, database `greenwood_cycle_a_test`. PostgreSQL binaries were under
`%TEMP%\greenwood-moderation-pg18\pgsql\bin`. Verify paths before using them;
do not operate on other clusters or production. Test logs in ignored `.tmp/`
are optional local evidence, not source artifacts.

## Preview caveats

The local preview was rebuilt and left running on port 3105 with an in-memory
test harness. At handoff its Node PID was 53848; **verify process identity before
stopping anything** because PIDs can change. Guest play is local-only. Data is
fictional and ephemeral. The temporary launcher was removed after startup to
avoid root lint scanning it, so there is no checked-in one-command launcher.

If it has stopped, recreate a small isolated harness from `auth/test-harness.ts`,
`buildApp`, `createDevWorld`, auth/classroom route registration and `attachRealtime`,
or use the existing tests as a reference. Do not simply run the server start or
migration scripts against unknown settings: both load the root `.env` if present.
Do not read `.env` to reconstruct the preview. Static UI rebuilds are served by
the running preview; backend changes require a restart.

## Release checklist when the owner requests it

1. Recheck branch/status and review the complete diff, including new files.
   Preserve the five unrelated documentation files above. Keep this work as
   Cycle A plus the approved refinements; do not start later cycles.
2. Resolve any concrete review findings with focused tests. For release, confirm
   the database suite against a dedicated test database. Do not call skipped
   tests passed or claim a fresh production verification from local evidence.
3. Stage only implementation, tests, migration and relevant docs; inspect staged
   diff for secrets/data and unintended files. Commit/push only when requested.
   A suitable title is “Add visual play foundation, saved appearance and minimap”.
4. Open a reviewable PR if requested. Describe behavior, migration, test evidence,
   limitations and AI assistance. Do not merge your own PR.
5. `render.yaml` targets **main**, auto-deploys after checks, builds with pnpm,
   runs `pnpm --filter @greenwood/server db:migrate` before deploy, and uses
   `/health/ready`. Pushing this feature branch alone does not publish it.
   Follow the owner's human-controlled release procedure and the backup/restore
   runbook. Deploy frontend and backend together: new clients require the new
   visual contract, and new backend persistence requires migration 0008.
6. After authorized release, verify the deployed revision, readiness, staff login,
   existing character appearance, new creation/approval, immediate movement/map,
   complete narration, chat scroll and moderation. Use approved test accounts;
   never collect student chat or production dumps into the repo.

Known limits to disclose: shared placeholder art, session-only discovery, nearby
session speech distinct from the teacher's private retained realm log, and no new
durability guarantee for existing health/focus/equipment systems. The command
client still tracks a single pending command; rapid multi-command disconnect
behavior was not specifically expanded by this slice. Investigate only if a
review or reproduction establishes an issue; do not claim it is covered by the
single-command reconnect tests.

## Suggested first response in Cursor

“I’ve read the visual-foundation handoff. The implementation is local on
`codex/visual-foundation`, not deployed. I’ll preserve the unrelated classroom
documents and work only on your requested next step.”

Then do the requested step. Do not spend the owner's remaining budget rebuilding
this handoff or automatically replaying every check.
