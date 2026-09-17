# Lesson: play, map, then propose a design sprint

Teacher-facing. Students play the live game, help you draw a graph of the world, then work in teams with Gemini to send you **one polished idea with no code**.

**Live site:** https://greenwood-collegium.onrender.com  
**Student Gemini file (they upload this):** [`gemini-design-sprint-handoff.md`](gemini-design-sprint-handoff.md)  
**Play script:** [`playthrough.md`](../../playthrough.md)  
**If you will also edit code today:** [`class-day.md`](class-day.md)

**Never put invite tokens, legal names, `DATABASE_URL`, or Render secrets on the projector, in Gemini, or in Google Classroom comments.**

---

## What this period is

The Collegium is a real game and a public proof of work. Interface upgrades do not start as “write the code.” They start as a **design sprint**: observe a problem in play, write the idea, keep the classic typed commands, then (later, not today) a ticket and a pull request.

Official ladder: [`docs/design-sprints/README.md`](../design-sprints/README.md) and PRD §12 / §30. First official interface sprint is **DS-001 — semantic colour**. Students may pick that or another **small** idea from what they actually saw.

Today they do **not** implement. Today they play, map, and write.

---

## Outcomes

| Who | Leaves with |
|---|---|
| Whole class | Everyone signed in. Courtyard load-tested by real browsers. A whiteboard graph of rooms and what can be touched. |
| Each team | One Google Classroom post: a polished design-sprint idea, **no code**, after 2–3 Gemini turns. |
| You | A stack of scoped ideas you can later turn into issues. A 10-point mark. |

---

## Before the bell

1. Confirm https://greenwood-collegium.onrender.com/health/ready returns `{"status":"ok"}`.
2. Teacher sign-in. Issue unused invites. Hand tokens **privately**.
3. Post the Google Classroom assignment (prompt + rubric below). Attach [`gemini-design-sprint-handoff.md`](gemini-design-sprint-handoff.md).
4. Open Render **Logs** on a side screen. That is the load test, not the localhost 30-client script. Do **not** point `pnpm --filter @greenwood/server load-test` at Render.
5. Draw a faint cross on the board: **Lantern Court** in the centre, arrows N / E / S / W. Leave room to add circles and labels.
6. Write the **board menu** (below) on a side panel. Title it **Start small. No pictures yet.**

Do not merge to `main` while they are connected. A deploy restarts the courtyard.

---

## Timing (one 60–70 minute period)

| Minutes | What | You |
|---|---|---|
| 0–8 | Invites, usernames (not legal names), Collegian form | Help stuck sign-ins. Watch connected count in logs. |
| 8–18 | Arrival together: `help`, `look`, `say hello`, `take key`, `north` | Each student has their own key. First hand does not empty the court. |
| 18–32 | Explore + **load**. Map out loud. | You draw the graph as they shout rooms. This *is* the classroom load test. |
| 32–38 | Notice. Your example: colour, labels, italics, bold, narrator vs Porter. | Point at the transcript. “What blends together?” |
| 38–42 | Teams of 3. One idea per team. Upload the Gemini file first. | Walk the board menu. Ban graphics and code in the write-up. |
| 42–62 | Gemini: at least 2–3 back-and-forths | If Gemini emits code, they must ask it to remove it. |
| 62–70 | Post the polished text to Classroom | One submission per team. |

If you have two periods: play + map in the first; notice + Gemini in the second.

---

## 1. Log in, play, load test

Students open the live URL only. Production has no guest button.

Arrival words:

```text
help
look
say hello
take key
north
quests
```

Then send them out. Useful later words: `examine porter`, `south` twice, `attack dummy` or `cast ember dummy`, `inventory`.

**Load test** means the whole class is signed in, walking, and talking at once. Watch Render logs for `socket_connected`, `command` (verb only), `rate_limited`, and crashes. Chat text is not logged. If the courtyard wobbles, keep playing; do not restart Render mid-period.

---

## 2. Map the game as a graph

Teach this sentence once:

> A **graph** is circles (nodes) joined by arrows (edges). Here a node is a **room**. An edge is an **exit**. Write on the circle what you can **do** there.

On the board, each room circle can hold:

- title (Lantern Court, Great Hall, …)
- who or what is there (Porter, dummy, a key, another Collegian)
- commands that mattered (`look`, `take`, `examine`, `attack`)

There are **twenty-five** rooms. They will not finish the map. That is the lesson: discovery is a growing graph.

Start them from Lantern Court:

| Direction | Room they should name |
|---|---|
| north | Great Hall |
| east | East Gate |
| south | South Orchard (Practice Dummy) |
| west | West Cloister (only back east — a dead-end is still a node) |

If they reach Library Stacks, someone may find the **one** moss-bound primer. That book is unique. The copper key is not: each Collegian has their own.

Do not read them the full room list. Let the graph come from play.

---

## 3. Notice what could be improved

Ask them to look at **the screen they already have**, not a fantasy MMO.

Your worked example (say this, then write three lines):

> Everything arrives as the same kind of text. Combat, quests, items, and system messages blend. We could use **semantic colour** — meaning-colours — plus labels like `[COMBAT]` `[QUEST]` `[ITEM]` `[SYSTEM]`. Colour must never be the only clue. Italics, bold, and a narrator voice versus Porter’s voice are the same idea: the interface tells you *what kind of information* this is, without changing `look` or `take`.

Then: “Your team picks **one** small improvement from what you saw, or from the board.”

---

## Board menu (write this)

**Start small. No graphic assets yet. Typed commands stay.**

- Semantic colour and message labels (official next sprint: DS-001)
- Italics, bold, narrator voice vs character voice
- Persistent character information (name, HP, focus, XP, room) so you stop retyping `inventory` / guessing
- Keyboard shortcuts, command history, Tab help
- Clearer `help` or on-screen command reminders
- More NPCs (text people you can `examine` and who have a line)
- More rooms or richer room text
- More quests after Arrival
- More combat or a clearer fight (still words)
- More story in what you already walk through
- A small quest reminder (not a painted journal)
- Better examine / look at yourself or other Collegians

**Not this period:** sprites, pixel art, 3D, sound packs, a new game, a mouse-only UI, “the browser decides if I hit.”

Official later sprints (for you, not a shopping list to finish today): status HUD, bags, quest journal, minimap, combat frame, Ember text effect, glyph rooms. Students may *mention* a later sprint as “after this,” but the submitted idea must be **one small slice**.

---

## 4. Teams and Gemini

- Teams of **three** (two only if the count forces it).
- One laptop or Chromebook talks to Gemini. The others keep the game or the notes.
- **First** they upload [`gemini-design-sprint-handoff.md`](gemini-design-sprint-handoff.md) into Gemini Pro 3.1 (or the school’s current Pro model). **Then** they talk.
- At least **two or three** turns: Gemini drafts → team says what is wrong or too big → Gemini tightens.
- The Classroom post must contain **no code** (no JSON, no TypeScript, no HTML, no CSS, no “paste this file”). If Gemini adds code, they ask: “Rewrite with zero code.”
- One idea per team. Classroom nicknames only.

---

## Google Classroom assignment (paste)

**Title:** Collegium design sprint — one idea, no code

**Instructions:**

Play on the live Collegium first. Map rooms with the class. Then, as a team, upload the Gemini handoff file I attached. Talk with Gemini at least two or three times. Submit **one** polished idea. No code. No pictures to draw. No legal names. Use classroom nicknames.

Your text should include: the problem you noticed in play, evidence (rooms and commands), a user story, a hypothesis, the design in words, what you will not do, and how a player with no colour still understands it.

---

## Rubric — /10

Two criteria, 5 points each. Post this on the assignment.

### A. Play evidence — /5

The idea is rooted in this game as they played it.

| Points | Look for |
|---|---|
| 5 | Names specific rooms, commands, or moments from their session. The problem is something a player could bump into today. |
| 4 | Clearly about this Collegium, with at least one concrete command or room. |
| 3 | About a text MUD in general; thin link to what they did. |
| 2 | A feature wishlist with almost no play. |
| 1 | Off-game or “make it like \[other title\].” |
| 0 | Missing, or only AI filler. |

### B. Small design, no code — /5

One improvement. Commands stay typed. Accessible. Nothing to compile.

| Points | Look for |
|---|---|
| 5 | One scoped change. No code. No art assets. Typed commands remain. Colour or emphasis is never the only meaning. Clear non-scope. |
| 4 | Small and readable; one constraint is thin (e.g. forgot “colour not only”). |
| 3 | A bit large, or a little code/pseudocode leaked in, or several features at once. |
| 2 | Graphics, a new game, or a wall of implementation. |
| 1 | Code dump or “build the whole roadmap.” |
| 0 | Missing, or only code. |

**10** is excellent. **8** is solid. Below **6**, ask them to resubmit after one more Gemini turn with the missing criterion named.

Mark the **submitted Classroom text**, not the Gemini chat log.

---

## What you might forget

- Invites on paper or a private screen, never the projector.
- The load test is **this class**, not the CI script aimed at Render.
- Do not merge `main` while they play.
- Do not upload `.env`, tokens, or student lists to Gemini.
- Do not upload the whole git repo. The handoff file is enough.
- Do not paste other students’ `say` lines into Gemini (their writing).
- West Cloister having no south exit is content, not a crash.
- The primer is unique; keys are per Collegian.
- Half the rooms have **no** NPC yet. That is a fair “more NPCs” pitch.
- School Gemini accounts, not personal ones, if that is policy.
- One Classroom submission per team, not three copies.
- If Gemini writes code, the mark for criterion B drops until they strip it.
- You are not starting Ticket 019 in this period unless you later choose to.

---

## After class

- Download Classroom submissions. They are student work; keep them off Git.
- If you want to implement one idea later, you write a GitHub issue and a design-sprint record. Students do not push to `main`.
- Class code edits stay on `class-2026-09-08` until after the bell.
