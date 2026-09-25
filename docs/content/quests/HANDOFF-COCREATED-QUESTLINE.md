# Handoff — co-created questline

Audience: the quest agent. Owner decisions below are locked (Philip Bird, 24 September 2026).
Class source: Deep Dive 01, “One Quest. Meaningful Choice.” Designers are named by
first name. Do not paste their assignment files into the repo.

This is a **build queue of side stories plus one server defense**. It is not a
second spine. Nothing here gates Arrival, the lessons, the bell, the queen, or
the East Watch.

Read before editing: [STORY.md](../STORY.md), [adventures.md](../adventures.md),
[quests/README.md](README.md), `packages/content/AGENTS.md`,
`packages/game-engine/AGENTS.md`. One slice per ticket. JSON is runtime truth.
Story notes land in `docs/content/quests/<id>.md` when that slice is implemented,
with a row in the README. Do not mark these ids live until the JSON exists.

---

## Locked

**In**

- Caleb’s server-wide defense of the college. Everyone online hears it. Personal errands wait.
- David’s mask, as a Greenwood object that changes how you are seen.
- Adrian’s costume, as worn faction gear that opens a closed camp.
- Real danger. Fights, raids, corruption, spores, and a kill-path trophy stay in the stories that ask for them.

**Out**

- Sokeipirim’s hardcore PvP: attacking other Collegians, stripping what they hold, treasure wars. Do not reskin it as an NPC mode.
- Gabriel Manalo’s player-killing, teleport-to-loot, and a key that hides itself so the quest can be run forever.
- Caleb’s player punishment. A loss does not delete quests, ink, gear, or progress, and does not lock a room against the people who fought.

**Still true**

- Surprise `attack` on a classmate stays refused (ADR-0038). Consented `duel` stays Flint’s practice.
- One completion, one reward. Clues are shared fixtures. Rewards are personal copies.
- Primer ink is not a quest payout. Dummy and event kills do not grant a lesson.
- Kaplan: every objective label names the next command.
- Side quests never required.

---

## What the engine can do today

Objective kinds, in `packages/game-engine/src/state.ts`: `look`, `say`, `take`,
`visit`, `examine`, `talk`, `defeat`, `cast`.

Progress, in `QuestProgress` / `apps/server` `QuestProgressRecord`: `status`
(`active` | `completed`), `completedObjectiveIds`, `rewardGranted`. Table
`quest_progress` (`apps/server/src/persistence/schema.ts`). No outcome column.

`handleTalk` (`packages/game-engine/src/talk.ts`) starts a quest when
`giverNpcId` matches and `requiresQuestIds` are complete. One
`experienceReward`. Optional one `itemRewardTemplateId`.

Shared spawns: one foe, victory stored on the Collegian (`defeatedSpawnIds`,
ADR-0037). `minParty` plus chorus is how several Collegians stand on one boss.
`admin announce` is a staff line, not a story event.

Worn slots already exist (`helmet`, `cloak`, `armor`, `ring`, and the rest in
ADR-0040 / ADR-0043). A worn piece does not yet open a door or change examine text.

---

## Three coding hooks

Build these before the stories that need them. Each hook is its own ticket,
with engine tests and a migration when a column is new.

### H1 — Remembered choice — **built 24 September 2026, [ADR-0046](../../adr/0046-remembered-choice.md)**

Shipped shape, which differs from both options sketched below: an objective may
carry an `outcome` id, and finishing it ends the quest on that outcome. No `choose`
kind and no new command. Untagged objectives are the shared prefix. Completion
needs every untagged objective plus exactly one tagged one, so the branch not
walked is never unfinished work. Content validation refuses a forked quest that
also sets a top-level `completionNarration` or `itemRewardTemplateId`, refuses an
unknown outcome id, and refuses an outcome no objective reaches. `experienceReward`
stays one number. `QuestProgress.outcome` persists as nullable `quest_progress.outcome`.

Original sketch, kept for the record:

`QuestProgress.outcome?: string` and the same field on the server
`QuestProgressRecord`. Persist it. Suggested column `outcome text` on
`quest_progress`, nullable, no rewrite of old rows.

Content shape (extend `questTemplateSchema` in
`packages/content/src/quest-schema.ts`; keep old quests valid):

- `outcomes`: two or more `{ id, completionNarration, itemRewardTemplateId? }`.
- An objective kind `choose`, **or** a `talk` target whose reply sets `outcome`.
- Completion is legal on any listed outcome. `rewardGranted` stays the
  once-only guard. Experience can match across outcomes so the fork is not a trap.

`createPlayState` may show the chosen line. The client must not invent it.

First consumer: **The Borrowed Ink**.

### H2 — Worn piece changes the world — **built 24 September 2026, [ADR-0047](../../adr/0047-worn-piece-changes-the-world.md)**

Shipped as specified. Both fields live on the item template and require an
`equipSlot`. A room is closed because some item names it in `admitsRoomId`, so there
is no second locked flag; that room may write `admissionRefusal`, and without one the
engine speaks a plain default. `handleMove` reuses `exit_closed`. Admission is checked
on entry, so removing a costume inside does not eject you, and walking back in without
it is refused again. Validation rejects an `admitsRoomId` naming an unknown room. No
stat changes anywhere.

Original sketch, kept for the record:

A worn item template may set:

- `examineRider`: extra plain text when someone examines that Collegian.
- `admitsRoomId`: while worn, a door or fixture allows entry. Unworn, the
  refusal is a normal narration, not a hidden syntax.

Check the paper-doll slots the server already restores (`characters.equipment`).
Do not add a second inventory. Do not add a flat stat percent. ADR-0043’s
once-per-fight reduction still applies only to the slots it already names.

First consumers: **The Pressed Mask** (`examineRider`), **The Passed Sentry**
(`admitsRoomId`).

### H3 — College defense phase — **phase built 25 September 2026, [ADR-0048](../../adr/0048-college-defense.md)**

Built: the phase, the three staff commands, the audit row, Alder in every transcript on
call and on join or reconnect, the quest-offer pause, the close timer plus lazy settle,
and restore-on-boot. Owner set the ceiling at **7 minutes**, which is also the default.
Not built yet, and next: raiders, the three gates, the trophy, and the aftermath room
text.

Original sketch, kept for the record:

One process-wide phase, not a per-character quest flag. Suggested module
`packages/game-engine/src/college-defense.ts`, persisted on the server (new
table or one row). Phases: `quiet`, `called`, `fighting`, `closed`.

- Teacher command starts it (staff path next to `admin announce`, audited, students refused).
- On start, every connected Collegian gets Alder’s narration. Reconnect and login during `fighting` get it again.
- Quest offers pause: `handleTalk` / `startQuest` return Alder’s “the yard first” line while `fighting`. Movement, look, attack, cast, defend still work.
- Clock is minutes, not `COMBAT_LOCK_MS`.
- On expiry, remaining gates close in narration by Flint and the porters. Phase becomes `closed`.
- Cancel is a staff line that the adults called it off. It does not roll back character rows.

Breach spawns are normal enemies with a defense id. Scale at the call: about one raider per two online Collegians, at least three per gate. Loot uses the existing personal-copy path for Collegians who defeated that spawn. Absence pays nothing and removes nothing.

Gates: Lantern Court, East Meadow, South Orchard. Room text after `closed` records the night (trampled hedge, a lantern out). That text does not remove an exit.

---

## Build order

Ship H1, then Ink. H3’s phase, then the gates. H2, then mask and costume.
Later stories are independent sides unless a `requiresQuestIds` is listed.
Suggested ids are stable once published.

### 1. The Borrowed Ink — Kevin — needs H1 — **built, [story notes](the-borrowed-ink.md)**

Giver is `npc-collegian-quire` at the East Gate rather than the barrow mouth: this
quest requires only Arrival, and the barrow sits deep in the East Watch. She is
dressed for the moor road she is about to walk, so the intent holds.

A Collegian at the barrow mouth left a bottle of ink in the Scriptorium and needs it to raise a spell. You take it. Return it and they give you a focus ring. Use it instead and the spell-work is yours; they thank you thinly and the ring is not offered.

**Play:** `talk` the Collegian, `visit` the Scriptorium, `take` the ink, then either `talk` them again (`outcome: returned`) or use the ink (`outcome: kept`).

**Hooks:** H1. Item `borrowed-ink` is personal, quest-spawned, not a shared fixture someone else can lose. Ring uses an existing necklace or ring slot and ADR-0043 only. The ink is not Primer ink. `requiresQuestIds`: Arrival. Giver is a new NPC, not Quill (Quill already has *The Missing Pages*).

**Ids:** `the-borrowed-ink`. Outcomes `returned`, `kept`.

### 2. The defense — Caleb — needs H3 — **built, [story notes](the-defense.md)**

One template `college-raider`, no placement, minted at the call. Trophy `raiders-token`
rides the ordinary loot path. Spawn ids carry the defense id. Aftermath text on the three
gates, no exit changed. Punishment stayed cut.

Raiders hit the college. Alder speaks in every transcript: drop the errand, defend the grounds. Three gates stand until the class breaks them or the clock ends and the staff finish what is left.

**Play:** teacher starts the phase. Students `travel` to a gate and `attack` / `cast`. `quests` shows the three gates and the clock. Trophy only if that Collegian’s `defeatedSpawnIds` includes a defense spawn from this phase.

**Hooks:** H3. Do not implement “everyone failed, so we take their rewards.” Do not stop movement. Offline Collegians see the aftermath text and receive no trophy. No Primer ink.

**Ids:** phase `college-defense`. Spawns `enemy-raider-court`, `enemy-raider-meadow`, `enemy-raider-orchard` (multiply instances, one template). Trophy item `raiders-token` or a named piece off the body.

### 3. The Pressed Mask — David — needs H2 — **built, [story notes](the-pressed-mask.md)**

Keeper is `npc-stairkeeper-vane` on the Bell Stair, the hedgehog who took Holm's
lamp-keeping job. Wearing the mask is an `equip` objective, a new objective kind (not
a new player command). Vane never takes the mask on the `returned` path, because the
engine cannot make an NPC take a held item; she sets it on the high ledge and pays for
restraint instead.

Under the grounds, a keeper asks you to find a mask. It is barrow stone, or a face the silk pressed flat. Wear it and you are changed: `examine` on you says so, and mentors answer that fact. Give it back and the keeper pays a smaller gift; your description stays yours.

**Play:** `talk` the keeper, `visit` the cache, `take` the mask, then `equip` it (`outcome: worn`) or `talk` the keeper with it in hand (`outcome: returned`).

**Hooks:** H1 for the fork, H2 for `examineRider` on the worn mask. No +50% stats. No vampire as a second ruleset. The frightening change is narration and NPC reply, not a new combat school. One completion. The worn mask survives logout.

**Ids:** `the-pressed-mask`. Item `pressed-mask` (`equipSlot` helmet or necklace).

### 4. The Passed Sentry — Adrian — needs H2 — **built, [story notes](the-passed-sentry.md)**

Spy is `npc-scout-tern` at the Reed Bank. Faction is the river thieves' basket camp:
new room `osier-camp` east of the Osier Holt, closed because `withy-ring` admits it.
The salt-grass escort stays out, as asked.

A spy needs intel from a closed camp of river thieves or silk-kept sentries. You take that faction’s helmet or ring and wear it. The door admits you. Unworn, the door says no in plain text. Inside, you examine the intel and bring it back.

**Play:** `talk` the spy, `defeat` or `take` the costume from a sentry, `equip` it, `visit` the camp, `examine` the intel, `talk` the spy.

**Hooks:** H2 `admitsRoomId`. Costume is a normal item in a real slot. Defeat in the camp is an ordinary combat loss: you keep the costume if you already hold it. You do not drop your pack. Not a cult. The salt-grass escort in the same paper is a later, separate quest; do not fold a follow-NPC into this slice.

**Ids:** `the-passed-sentry`. Item `sentry-mask` or `thief-ring`.

### 5. Mist’s door — Chazen — needs H1

Mentor Mist, Hearth of Veil, wants a side room beside the Bell Stair sealed. Something is moving in it. Seal it and take her wand. Leave it open and you may enter and fight what is there; Mist stays cold. The Bell Stair itself never locks. The spine does not check this quest.

**Play:** `talk mist`, then `choose` seal or open. Seal completes. Open requires `visit` plus `defeat`, then completes.

**Hooks:** H1. New room, new exit, not a rewrite of Clock Tower `down`. Foes are husks or mist-things. Wand is a personal item, not a damage-plus-one outside ADR-0043.

**Ids:** `mists-door`. Room `mist-alcove`.

### 6. A thread that walks — Vansh — needs H1

You were beaten by a boss at the start of this chain. You gather silk, pass the guards, and reach a silk-worker beside Fen or under the gallery (not a witch). Then you choose: a sweater you wear, or a spider that fights beside you.

**Play:** `talk` the worker after `defeat` silk sources and the guard, then `choose`.

**Hooks:** H1. Sweater is `equipSlot` cloak or armor. The spider is the new hook inside this ticket: a per-character ally id on the Collegian, joined only in that Collegian’s encounters, dismissed when this story’s final foe dies. Do not build a pet inventory. Final boss stays in the chain.

**Ids:** `a-thread-that-walks`.

### 7. Shellington — Shanayah — **built, [story notes](shellington.md)**

Lumen at the Hearth of Stars needs a book. Shellington the otter is at Crow Stile, corrupted. You fight him, bring him back, and Lumen cures him. His diary says the creatures are not what they seem. Later NPC lines may acknowledge the diary.

**Play:** `talk lumen`, `visit` Crow Stile, `defeat` Shellington, `talk lumen`.

**Hooks:** existing `defeat` + `talk`. Drop is certain, not 50%. Diary is a personal item. `requiresQuestIds`: first Stars lessons if Lumen should already know you. Do not put a secret-menu in the client.

**Ids:** `shellington`.

### 8. The wrong camp — Calix — needs H1

You are sent against a rival camp. Kill them and you keep a tooth necklace; that is the story of that path. Spare them and they stand with you against the real foe. A field note at the end says you were aimed at the wrong people.

**Play:** `talk` the sender, `visit` the camp, `choose` spare or kill, then `defeat` the real foe, `talk` the sender.

**Hooks:** H1. Necklace only on `kill`, ally-for-one-fight only on `spare` (same ally shape as slice 6 if that landed; otherwise narration plus a combat bump authored as a status the engine already has, or wait for slice 6). No “book of secrets” UI. No PvP.

**Ids:** `the-wrong-camp`.

### 9. The feast hour — Ahmed — needs H1

Before a Collegium supper, a friend needs something recovered. The mission on the board is also due. Help the friend, or finish the mission. Both complete. The relationship line is the consequence. Experience matches.

**Play:** `talk` the friend in Lantern Court, do one path, `talk` them again.

**Hooks:** H1. Use the existing noticeboard / `seek` only if the mission is already a posted quest; do not invent a town outside the map.

**Ids:** `the-feast-hour`.

### 10. The bear’s key — Chanelle

An old bear wants his key so he can go home. He tells you the last place he saw it. Someone else wants it. You hide and run, or you duel them. The key opens his way home.

**Play:** `talk` the bear, `visit` the last-seen room, `examine` / `take`, then `choose` hide or `defeat`, return, `talk` the bear.

**Hooks:** H1 if both hide and duel must complete. A single `defeat` path can ship on today’s verbs; hiding needs H1 or a `visit` escape room that counts as the other outcome. New room discovered on completion, side-only.

**Ids:** `the-bears-key`.

### 11. The blighted row — Lordjynn

Alder sends you to a parasite in the crops. It eats the food and throws spores. Kill is one ending. The second ending was left blank in the paper; do not invent it in silence. Ask, or ship kill-only as `defeat` plus `talk alder` and leave `outcome` for a follow-up.

**Hooks:** today’s verbs for the kill path. Giver can be Alder only if `resolveAlderSpeechNode` grows one side node that does not offer the bell early. Safer giver: Tansy, `requiresQuestIds`: `a-little-room-to-grow`.

**Ids:** `the-blighted-row`.

### 12. The missing second — Lyla

The spider cannot be faced alone. The one who could help is missing. The search costs (hunger as narration and a shrinking clock, not a wiped pack). They follow only until that fight ends, then leave.

**Hooks:** ally shape from slice 6. `requiresQuestIds`: do not block `what-still-sleeps`; this is a side echo of needing a second, not a replacement for `minParty`. Hunger must not delete items.

**Ids:** `the-missing-second`.

### 13. Birds and stones — Ryder

After Alder’s early quests, a mentor opens a clearing west of the greenhouse. Three crows, or one harder crow. Leave before either set is done and those crows are whole again. The clearing’s description changes for that Collegian when the quest completes. Taking the eggs is an optional darker objective, not required.

**Hooks:** `defeat` objectives. Reset-on-leave is new: store defense progress on the quest and clear those objective ids if the character `move`s out before the set is complete. Do not reuse `the-uncounted-flock` or pay Primer ink. Room title stays shared; the quiet line is personal narration or a per-character rider.

**Ids:** `the-shaded-clearing`. Room `flock-shaded-field`.

### 14. Linda — Lily and Nadia — blocked

A friend disappears with a letter meant for you. Rooms open as you search. Someone took her. **Do not write the ending until Lily and Nadia name the two approaches.** Keep the taker. She is found alive.

**Ids reserved:** `finding-linda`.

### 15. Briar’s making — Zian — needs a fork

After the Silk Queen and the Mist Hound, Lumen asks you to carry those materials to Mentor Briar, who makes a weapon. Add a real fork before building: which making, or whether Briar receives the materials. No crafting UI. Personal weapon on an existing slot.

**Ids:** `briars-making`. `requiresQuestIds`: `what-still-sleeps`.

### 16. Hudrick’s room — Gabriel Wiest

A room is wrecked. You choose health, focus, or stamina, gather what that room needs, and kill the creature holding the last piece. The room then trains that stat. The timing minigame is out of this queue.

**Hooks:** H1 for the three outcomes. Training that grants permanent stats beyond the lesson curve needs its own ADR; until then the “training room” is repeatable practice against a dummy that does not pay a second quest reward.

**Ids:** `hudricks-room`.

### 17. Quill’s second book — Lennox — **built, [story notes](quills-second-book.md)**

After *The Missing Pages*, a book last seen in the High Study sends you through Alder to the archive cellar and three bats, then back to Quill.

**Hooks:** today’s verbs. `requiresQuestIds`: `the-missing-pages`. Do not replace that quest.

**Ids:** `quills-second-book`.

### 18. The locked safe — Gabriel Manalo, PK removed

A tiger guards the room where a key is. The safe pays either experience or a piece of armor. One completion. The key does not relocate. No player is a target.

**Hooks:** H1 for the reward fork. `defeat` the tiger, `take` the key, `examine` the safe, `choose`.

**Ids:** `the-locked-safe`.

### 19. Classes — Maria — separate track

Optional hearth lessons, announcements of when a class is starting, practice flavoured by school. Attendance is never required and never gates the spine. This is a feature track, not a quest in the queue above. No timed school-subject minigames in the first ticket.

### 20. One chamber, one scroll — Tucker

A secret chamber offers two scrolls. Taking one closes the other. Bind them to two Schools so they are Primer leaves with a place, not a better spell beside the Primer.

**Hooks:** H1. `ink` remains the Primer command. The chamber only opens a node the engine already considers legal, or it refuses.

**Ids:** `one-chamber-one-scroll`.

---

## Ticket shape

For each implemented id:

1. `docs/content/quests/<id>.md` with the header block used by `fens-linen.md`.
2. A side-row in `docs/content/quests/README.md`. Do not insert these into the spine graph in `STORY.md` except the defense, which is an event, not a numbered spine step. One sentence in STORY is enough when H3 lands: a teacher may call a defense; it does not gate the walk.
3. `packages/content/quests/<id>.json`, rooms, items, enemies. No TypeScript registry.
4. Engine tests for any new field or phase. Content validate. Server test that reward and outcome survive restart.
5. Plain narration on every event. Labels name the command.

Do not start Linda or Briar until the missing fork is written down. Do not start Sokeipirim. Do not add a punishment branch to the defense.
