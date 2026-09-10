# First adventures at the Collegium

For stable IDs, room exits, fixtures, quest objectives, and implementation entry
points, see the [developer room and quest summary](room-and-quest-summary.md).

The September 10 content pass enriches all 25 existing rooms without changing room
IDs, exits, or map placement. Each room has an examinable object. Six members of
staff have authored conversations: Porter Bramble, Headmaster Alder, Librarian
Quill, Groundskeeper Tansy, Healer Fen, and Instructor Flint.

## Playing

Start with `talk porter` or `examine noticeboard` in Lantern Court. `talk to Porter
Bramble` also works. `look` lists nearby people and objects; `x` is shorthand for
`examine`. `help talk` explains conversations and `quests` lists your checklists.
NPC names use the existing blue treatment, objects use green, and quest updates
use gold. Plain narration and labels carry all the meaning without colour.

Three new quests are available alongside Arrival at the Collegium:

- **The Missing Pages:** From Lantern Court, go north, west, then `talk quill`.
  Investigate the Ink Blotter in the Scriptorium and the Folded Page in the Music
  Loft. Return to Quill with an explanation. Reward: 10 experience.
- **A Little Room to Grow:** Go south, west from Lantern Court, then `talk tansy`.
  Examine the Seedling Tray in the Greenhouse and the Watering Jug in the Pottery
  Shed; `talk fen` in the Infirmary for advice. Return to Tansy. Reward: 10 experience.
- **The Bell Below:** Go north from Lantern Court and `talk alder`. Investigate
  the Empty Bell Frame in the Clock Tower, the Bell Ledger in the Archive Cellar,
  and the Listening Stone in the Quiet Chapel. Return to Alder. Reward: 15 experience.

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
progress remains temporary. Quest completion grants its experience once.

The bell story answers how the sound travels through the living wood while leaving
its first cause open for a future adventure. No inaccessible room is required.

## Authoring

Add an NPC to an existing room's `fixtures` with `kind: "npc"`, a stable `id`,
`name`, `lookDescription`, `examineDescription`, and a plain-text `dialogue` string.
Use a recognisable name and mention the `talk` command in its visible description.
Full staff names belong in `character-creation/names.json`'s reserved list.

Add quests as individual JSON files under `packages/content/quests/`. No TypeScript
registration is needed. The added fields are:

- `giverNpcId`: a speaking NPC fixture. Talking to that NPC starts this quest once.
- `completionNarration`: a plain-text conclusion appended to the completion event.
- Objective kinds `examine` and `talk`: require `targetId`, referencing a fixture;
  a talk target must be a speaking NPC. Examining loose inventory items is not a
  supported objective target in this slice.
- Objective `requires`: an optional list of earlier objective IDs. Each must already
  be complete before this objective can advance. Dependencies must be unique and
  point backwards in the definition, preventing cycles. The investigation clues
  themselves have no dependencies; the final report requires every clue.
- Optional objective `roomId` restricts the action to that room. For fixture
  objectives it must match the fixture's actual room.

The existing Arrival format remains valid. Keep published quest and objective IDs
stable because saved progress references them. New fields are optional and reuse
the existing progress rows; no database migration or new dependency is needed.

Run `corepack pnpm build` and `corepack pnpm --filter @greenwood/content validate`.
Malformed dialogue, unknown givers or targets, duplicate objective IDs, and invalid
dependencies fail content validation. Engine tests cover command matching and
reward guards; server tests cover all three routes with 30 independent characters
and authenticated progress across server restarts.
