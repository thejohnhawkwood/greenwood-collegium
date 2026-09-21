# First adventures at the Collegium

How to **play** the live quests and how to **author** JSON. Story tone and the
spine live in the [story bible](STORY.md). Each storyline has its own file under
[quests/](quests/README.md). Spells and the Field Primer live in
[PROGRESSION.md](PROGRESSION.md). Live IDs and exits live in
[room-and-quest-summary.md](room-and-quest-summary.md).

JSON remains runtime truth. The bibles are author truth. Do not invent a second
plot or a second kit.

---

## Playing

Start with `talk porter` or `examine noticeboard` in Lantern Court. `talk to Porter
Bramble` also works. `look` lists nearby people and objects; `x` is shorthand for
`examine`. `help talk` explains conversations and `quests` lists your checklists.
NPC names use the existing blue treatment, objects use green, and quest updates
use gold. Plain narration and labels carry all the meaning without colour.

### Spine (walk these in order)

| Storyline | Start | Story |
| --- | --- | --- |
| Arrival at the Collegium | Auto in Lantern Court. `look`, `say hello`, `take key`, `north`. | [arrival.md](quests/arrival.md) |
| College lessons | Alder picks a School. Look around the hearth, defeat the dummy, cast, talk. | [college-lessons.md](quests/college-lessons.md) |
| The Bell Below | After first lessons, `up` from the Great Hall, `talk alder`. | [the-bell-below.md](quests/the-bell-below.md) |
| The Bell Wakes | After that report, `talk alder`. `down` from the Clock Tower. Talk Piper. | [the-bell-wakes.md](quests/the-bell-wakes.md) |
| What Still Sleeps | After Wakes, `talk alder`. Take two classmates. Deep Cradle. | [what-still-sleeps.md](quests/what-still-sleeps.md) |
| The East Watch | After the queen report and Alder’s leave. `north` from East Meadow. Talk Wren. | [the-east-watch.md](quests/the-east-watch.md) |

### Side (never required)

| Storyline | Start | Story |
| --- | --- | --- |
| The Missing Pages | North, west from Lantern Court, `talk quill`. | [the-missing-pages.md](quests/the-missing-pages.md) |
| A Little Room to Grow | South, west, `talk tansy`. | [a-little-room-to-grow.md](quests/a-little-room-to-grow.md) |

Flint in the South Orchard teaches `attack` / `cast ember` and consented `duel`.
That is practice, not a quest file.

Accept a quest before investigating its clues. Clues can be investigated in any
order, but the final conversation counts only after all the required discoveries.
Looking at a room alone does not count as examining its clue. If you explored a
clue before accepting, examine it again. Talking to the giver early offers a reminder.

Conversations are authored and private to the participating Collegian. They do not
broadcast player speech or appear in the staff `say` archive. Use `say` for other
players. Talking to an NPC neither heals characters nor changes combat rules;
Flint explains the existing practice encounter, and Fen offers written advice.

Clues remain available to the whole class. No student can take or consume a quest
fixture. The missing page is reported for collection, and Tansy prepares a repair;
neither story removes a shared object. Progress and experience belong to each
character. Authenticated progress survives reconnects and server restarts; guest
progress remains temporary. Quest completion grants its experience once. The
investigation and silk quests also leave one personal item in the pack. Type
`spells` to read the Field Primer. After college, three clickable leaves
open on the page. Each character lesson grows health
and focus. First-time dummy and queen memory is saved with the Collegian.

Canon: the queen fight is required to finish What Still Sleeps;
Piper lives; Keeper Holm is the named loss under the tower. See
[what-still-sleeps.md](quests/what-still-sleeps.md). The bronze’s resting place
continues in [the-east-watch.md](quests/the-east-watch.md).

---

## Authoring

Add an NPC to an existing room's `fixtures` with `kind: "npc"`, a stable `id`,
`name`, `lookDescription`, `examineDescription`, and a plain-text `dialogue` string.
Use a recognisable name and mention the `talk` command in its visible description.
Full staff names belong in `character-creation/names.json`'s reserved list.

Add quests as individual JSON files under `packages/content/quests/`. Add the
matching storyline markdown under `docs/content/quests/` and a row in
[quests/README.md](quests/README.md) plus the spine graph in [STORY.md](STORY.md).
No TypeScript registration is needed. The added JSON fields are:

- `giverNpcId`: a speaking NPC fixture. Talking to that NPC starts this quest once.
- `completionNarration`: a plain-text conclusion appended to the completion event.
- Objective kinds `look`, `say`, `take`, `visit`, `examine`, `talk`, `defeat`, `cast`.
  `examine`, `talk`, `defeat`, and `cast` require `targetId`. `take` requires
  `itemTemplateId`. `visit` requires `roomId`. Examining loose inventory items is
  not a supported objective target in this slice.
- Objective `requires`: an optional list of earlier objective IDs. Each must already
  be complete before this objective can advance. Dependencies must be unique and
  point backwards in the definition, preventing cycles. The investigation clues
  themselves have no dependencies; the final report requires every clue.
- Optional objective `roomId` restricts the action to that room. For fixture
  objectives it must match the fixture's actual room.

The existing Arrival format remains valid. Keep published quest and objective IDs
stable because saved progress references them. New fields are optional and reuse
the existing progress rows; no database migration or new dependency is needed.

Tone, grim ceiling, and Kaplan’s test live in [STORY.md](STORY.md). Do not write
college-poetry leaps. Side quests must not gate the spine.

Run `corepack pnpm build` and `corepack pnpm --filter @greenwood/content validate`.
Malformed dialogue, unknown givers or targets, duplicate objective IDs, and invalid
dependencies fail content validation. Engine tests cover command matching and
reward guards; server tests cover investigation routes with 30 independent
characters and authenticated progress across server restarts.
