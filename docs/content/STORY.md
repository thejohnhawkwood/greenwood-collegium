# STORY.md — living story spine

Author truth for **tone, cast, and the quest spine**. Scene-level quest copy lives
in [quests/](quests/README.md). Runtime truth remains JSON under `packages/content/`.
If this file and a live quest file disagree, the live file is what students play
until a content ticket lands.

Read this before rewriting rooms, NPCs, quests, items, or combat flavour. Then
open the matching storyline under `docs/content/quests/`. Do not invent a second plot.

Last updated: 20 September 2026. Locked: story may lead; named loss allowed; East
Moor for lessons 4–10; Piper lives; Keeper Holm is the named loss under the Clock Tower.

**Also read:** [adventures.md](adventures.md) (play and JSON authoring),
[PROGRESSION.md](PROGRESSION.md) (Field Primer),
[room-and-quest-summary.md](room-and-quest-summary.md) (live IDs and exits).

---

## 1. How to use these files

- **Spine here.** Order, tone, cast, campus, XP, failure modes, open mysteries.
- **Storylines in `quests/`.** One markdown file per series or side quest.
- **JSON still wins at runtime.** New rooms and quests ship as content files.
- **Stable IDs.** Published quest and objective IDs are in saved progress. Keep
  them unless the ticket includes a progress migration.
- **Kaplan’s test.** Every objective must tell a Grade 9 student the next command.
  Mystery lives in what they find, not in guessing `talk` versus `examine`.
- **Do not implement from flavour alone.** Implementable notes sit at the bottom
  of each storyline file. JSON is runtime truth.

---

## 2. Tone law

The Greenwood Collegium is Redwall meeting Gwelf meeting woodland school-mystery.
Cozy and grim share the same parish. Danger is real. Cheer is earned.

### 2.1 What the writing must do

- **Sensory first.** Smell, temperature, sound, named objects, food, weather, and
  fear in the body (whiskers, paws, a whistle held in the teeth).
- **One motif per room.** Bell, silk, oak, lantern, peat, wet wool, bread.
- **One metaphor if it earns its keep.** “Warm as bread just taken from the oven”
  is allowed. “Stars that have come down to listen” is not, unless the lanterns
  are actually doing something a student can see.
- **High-school diction.** Complete sentences. “Talk to Alder.” “Look around this
  hearth.” Do not invent “Look this hearth” or “Talk the Headmaster.”
- **Cozy after grim.** After Holm, after Colm, someone puts food in a paw. Alder’s
  “Go to class. Eat something warm” is law. Fen’s infirmary is law.
- **Originality.** No franchise names, no copied Redwall or Gwelf prose.

### 2.2 Grim ceiling (classroom)

Named loss is allowed. Aftermath, not torture.

- Students may find someone wrapped, missing, or already gone.
- No gore, wounds catalogued, on-screen eating, torture, or sexual content.
- No student-character death.
- Holm and Colm are **adult staff**.
- The fear is **keeping**: a person still doing their job, held still, silenced.
  A coat, a lantern still burning, silk pressed flat across a muzzle. Not blood.

### 2.3 Diction tests

**Fail:** “stars that have come down to listen”; “the hush feels offered rather
than demanded”; “the room agrees”; “the silk has a mouth now” as the *only* image;
spell copy that says “authored flat number.”

**Pass:** “something sweet that should not be sweet this far below”; “the whistle
was in my teeth the whole way up”; “we lost a cactus that way”; “every seventh
tooth has been painted blue by someone who clearly lost count.”

**Grade-9 check.** If a student has to translate the metaphor before they can see
the room, cut it.

### 2.4 Quest structure we steal (and refuse)

1. **World of Warcraft** — hub, breadcrumb, chain. Mix examine / talk / visit /
   defeat. Mystery never hides the next command.
2. **Final Fantasy XIV** — one MSQ spine. Side quests never gate it. Climaxes are
   `minParty` duties.
3. **RuneScape** — named series; completing a quest opens a place or a question.
4. **Discworld MUD** — every named fixture is worth `examine`. Refuse hidden
   quests and secret per-quest syntax.
5. **Kingdom of Loathing** — Alder is the council. The log states the next action.

**Greenwood hybrid:** spine everyone walks; High Study then Wren’s Croft as hubs;
third lessons become a real handoff; Quill / Tansy / Flint stay optional; one-time
personal progress; shared fixtures; no consuming world objects.

---

## 3. Motifs

| Motif | Means | Must not become |
| --- | --- | --- |
| **Bell / empty frame / three pulses** | Abbey welcome still travels in living oak. Bronze taken on a wet night. | “Memory” with no object |
| **Silk / husks / warm thread** | A cradle that learned to keep living things still | Holm as a silk-child |
| **Oak** | Collegium and abbey share one wood | “The wood remembers” as the only sentence |
| **Lanterns (blue)** | Collegium light. Holm hung one so the stair would not go dark | Generic cosiness |
| **Keys / whistles** | Arrival, porter’s board, Holm’s empty hook, Piper’s run | Puzzle-box or comic prop |
| **Food / tea / oatcakes / honey** | The hearth after the grim | A joke that undercuts a death |
| **Peat / wet wool / mist / stones** | East Moor. Different hunger from silk | A second spider dungeon |
| **Six Schools** | Ember, Thorns, Veil, Stars, Stone, Steel | Lore dumps in mentor intros |

Three pulses (frame, chapel, silk, later the barrow bronze) are the same count.

---

## 4. Cast (who knows what)

Secrets are for authors. Dialogue says only what that speaker will say *now*.
Scene lines live in the storyline files.

| Who | Where | Lives | Notes |
| --- | --- | --- | --- |
| Headmaster Alder | High Study | yes | Facts, not rumours. No moor talk until the queen is reported. |
| Porter Bramble | Lantern Court | yes | Arrival coach. Later: Holm’s empty hook. |
| Piper Mole | Silk Gallery | **yes** | Witness. Names Holm after the wrapping is seen. |
| Keeper Holm | fixtures only | **no** | Lantern, wrapping, coat-button. Not a talk target. |
| Mentors (six) | Hearths | yes | Dummy and Primer. One Holm sentence after the spine beat, never a second plot. |
| Instructor Flint | South Orchard | yes | Practice and duels. Not a giver. |
| Librarian Quill | Stacks | yes | [Missing Pages](quests/the-missing-pages.md) only. |
| Groundskeeper Tansy | Herb Garden | yes | [A Little Room to Grow](quests/a-little-room-to-grow.md). |
| Healer Fen | Infirmary | yes | Consult, defeat-wake, honey after grim. Not a spine hub. |
| Shepherd Wren | Wren’s Croft | **yes** | East Watch hub. |
| Colm | fixture under the barrow lip | **no** | Moor named loss. Students never `talk colm`. |

Reserve `keeper holm`, `shepherd wren`, and `colm` in `character-creation/names.json`.
Do not take names from the suggested student pool (`Sedge` is already a surname).

---

## 5. Campus in story terms

Not a second exit table — use [room-and-quest-summary.md](room-and-quest-summary.md).

- **Lantern Court** is home. Arrival starts here.
- **Great Hall / High Study** is Alder’s watch.
- **Hall of Schools** stays **east** of East Meadow (class). The moor road is
  **north** off the meadow (see [The East Watch](quests/the-east-watch.md) for the
  map collision at the Infirmary tile).
- **Clock Tower down** is the old abbey: Bell Stair, Silk Gallery, cloister, nave,
  Deep Cradle. First true danger, still under the school.
- **Chapel and Archive** prove the bronze is gone. They do not yet say where it went.
- **South Orchard** is Flint. Practice is honest. It is not the queen.
- **Herb Garden parish** is Tansy and Fen.
- **River Landing** is a side hub of river-thieves. It does not steal the bronze. South from the orchard, `talk marram`.
- Worn quest clothes are a record of the walk ([ADR-0043](../adr/0043-paper-doll-helps.md)). They are not a second plot and they do not raise the Primer's health or focus.
- **West Cloister / Porter Lodge / dorms / kitchens** may nod at the spine. They
  are not fetch hubs.

---

## 6. The spine

Live JSON: 41 quests, 66 rooms. Cross-quest prereqs use `requiresQuestIds` plus
Alder/Wren engine offers (Arrival auto-start, school pick, lesson chain, Alder bell
and moor offers). `giverNpcId` is used by the side hubs and by Wren’s L4–L8.

```text
JOIN
  → Arrival                    docs/content/quests/arrival.md
  → school pick (Alder)
  → College lessons            docs/content/quests/college-lessons.md
       ├─ first / second / third (third = East Watch breadcrumb AFTER queen)
       └─ The Bell Below       docs/content/quests/the-bell-below.md
            → The Bell Wakes   docs/content/quests/the-bell-wakes.md
                 → What Still Sleeps   docs/content/quests/what-still-sleeps.md
                      (Holm + queen defeat)
                      → The East Watch docs/content/quests/the-east-watch.md
```

Side, any time, never required:

```text
talk Quill  → The Missing Pages          docs/content/quests/the-missing-pages.md
talk Tansy  → A Little Room to Grow      docs/content/quests/a-little-room-to-grow.md
talk Porter → Porter's Night Round       docs/content/quests/porters-night-round.md
talk Fen    → Fen's Linen                 docs/content/quests/fens-linen.md
talk Hobb   → The Empty Byre … One Page For Three  docs/content/quests/the-east-watch.md
talk Marram → The Cut Painter … Black Mooring  docs/content/quests/the-river-watch.md
Flint       → practice / duel only
```

Index: [quests/README.md](quests/README.md).

### 6.1 XP to *reach* a lesson

From `packages/game-engine/src/progression.ts`. Primer law:
[PROGRESSION.md](PROGRESSION.md), [ADR-0039](../adr/0039-field-primer.md).

| Lesson | XP to reach | Delta |
| --- | --- | --- |
| 2 | 10 | +10 |
| 3 | 25 | +15 |
| 4 | 45 | +20 |
| 5 | 70 | +25 |
| 6 | 100 | +30 |
| 7 | 140 | +40 |
| 8 | 190 | +50 |
| 9 | 250 | +60 |
| 10 | 320 | +70 |
| 11 | 400 | +80 |

Cap 20. College (lessons 1–5) is teacher-and-dummy. Lessons 6–20 open Primer picks
on the level. Rooms for 11–20 are not built.

Typical path without sides: Arrival 10 → first 15 → second 20 → third 25. A
Collegian who also walks the bell line sits at **lesson 4 or 5** at the moor door.
That is intended. East Watch then carries them toward 10.

### 6.2 Failure modes (every storyline must respect)

- **Solo at the queen.** `visit` does not require three Collegians. `minParty: 3`
  only blocks square-up. [What Still Sleeps](quests/what-still-sleeps.md) is not
  complete without `defeat`.
- **Alder collision.** He does not discuss the East Moor until Sleeps is complete
  **and** third lessons are complete. Third-lessons talk does not count until
  Sleeps is done. See [college lessons](quests/college-lessons.md).
- **Queen fight required.** Live Sleeps is wrapping, visit, score, **defeat**, talk.
- **Piper after Holm.** `holm-named` after the wrapping; `after-queen` after Sleeps.
- **Kitchens memorial.** Holm and Colm initials on a battered bread tin (`object-kitchen-initials`). Not a sermon.

---

## 7. Held ideas (not this campaign)

- Dorms stay comfort. Sleepless students go to Fen, not a jump-scare mobile.
- Lessons 11–20 parish: do not sketch beyond the open mysteries below.

---

## 8. Open mysteries

Answered:

- Who hung the cloister lantern? **Holm.**
- What happened to him? **Kept. Wrapped. Past air.** ([What Still Sleeps](quests/what-still-sleeps.md))
- Where did the bronze go? **Into the East Moor barrow.** ([East Watch](quests/the-east-watch.md))
- Who lived to tell it? **Piper. Wren. The class.**

Not answered (do not fill in a random ticket):

- Who took the bronze on the wet night — thief, walker, or frightened keeper?
- What the unopened cocoons still hold.
- Whether the oak will go quiet if the bronze is ever hung again.
- Lessons 11–20 parish.
- River hunger. The landing side names thieves and kept cargo. It does not say what the river wants.

If you need a new plot, add a dated subsection here **and** a file under
`quests/`. Do not fork a second spine.

---

## 9. Cheat sheet

- Tone: sensory, one motif, one earned metaphor, Grade-9 diction, cozy after grim.
- Spine: Arrival → school → bell → **Holm + queen defeat** → East Watch 4–10.
- Piper lives. Wren lives. Holm and Colm do not.
- Terror is keeping, not gore.
- Hall stays east of the meadow. Moor command is `north`. Map column starts at `x: 6`.
- Side quests never gate the spine.
- JSON is runtime. This file is the spine. Storylines are the modules.
