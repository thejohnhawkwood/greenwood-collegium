# Greenwood Collegium — team context for Gemini

Students: upload **this whole file** into Gemini Pro 3.1 (or your school’s Gemini Pro) **before** you chat. Then talk as a team. Your teacher will grade what you **paste into Google Classroom**, not this file.

You are not writing a program today.

---

## How to use Gemini

1. Upload this file.
2. Your first message should be the block under **First message** at the bottom.
3. Read the reply. Argue. Make it smaller or clearer.
4. Send at least **two more** messages (three turns total is the minimum).
5. When you are satisfied, copy the **final polished idea** into Google Classroom.

**Hard rule: the Classroom submission must contain no code.**  
No TypeScript, JavaScript, HTML, CSS, JSON, file paths, SQL, or “paste this into the repo.”  
If Gemini prints code, reply: `Rewrite the entire idea with zero code. Describe only what a player sees and types.`

Do not paste invite tokens, passwords, legal names, or other students’ `say` lines into Gemini.

---

## What this game is

**The Greenwood Collegium** is a browser text game (a MUD) for class. You type commands. The server decides what happens. The page only shows the result.

Live play (no guest button):

https://greenwood-collegium.onrender.com

You signed in with an invite, chose a classroom username (not a legal name), and made a woodland Collegian.

The game is deliberately simple on purpose. The first interface is a **classic typed transcript**. Later official work may add colour, a status strip, better keyboard help, bags, a quest list, a minimap, a combat frame, and eventually coloured glyphs. **Not pictures or 3D. Not this assignment.**

A **design sprint** is how this project decides a change: play, notice a problem, write evidence, propose a small interface or content change, list what you will not do, check that a player who cannot use colour still understands, then (later, adults) put it on a ticket. You are doing the writing step only.

---

## What exists today (so you do not invent a different game)

You start in **Lantern Court**. Porter Bramble (hedgehog, too-large coat) greets you. The first quest is **Arrival at the Collegium**.

Words the game teaches:

| You type | What it does |
|---|---|
| `help` / `help look` | Lists words, or explains one word |
| `look` | Describes this room |
| `say hello` | Speaks in the room |
| `north` `south` `east` `west` | Walk, if there is an exit |
| `take key` | Pick up something you can see |
| `drop key` | Put something down |
| `examine porter` or `x porter` | Look closer. Works on some people and things |
| `inventory` or `i` | What you are carrying |
| `attack dummy` | Practice fight in the South Orchard |
| `cast ember dummy` | First spell, during a fight |
| `quests` | Your tasks |

Facts from play:

- There are about **twenty-five** rooms. Many are almost empty of people.
- Each Collegian gets their **own** small copper key. The first `take key` does not steal everyone else’s.
- The **Practice Dummy** is in the **South Orchard** (`south` from Lantern Court, then you are there).
- There is a **moss-bound primer** in the library stacks. That book is **one** copy for the whole school.
- West Cloister does not open south. A wall is not a crash.
- Combat and Ember already work as **text**. Health and focus exist, but they are easy to lose in the scrollback.
- Other Collegians in the room can be examined. `say` is public in the room. There are no private messages.

If you did not see it in the game, do not pretend you did. Use what your team typed.

---

## Your job

As a team, propose **one small improvement** to **the game you already played**.

Good ideas (start small, **no graphic assets**):

- Semantic colour and labels such as `[COMBAT]` `[QUEST]` `[ITEM]` `[SYSTEM]` so the transcript is easier to scan
- Italics, bold, or a narrator voice versus a character voice
- Persistent character information (name, health, focus, experience, room)
- Keyboard shortcuts, up-arrow history, Tab help, a reminder of legal words
- Clearer `help`
- More NPCs (text people to examine, who might say a line)
- More rooms or stronger room descriptions
- Another short quest after Arrival
- More or clearer combat (still words)
- More story in rooms you already walked
- A small quest reminder

Bad ideas for this assignment:

- Sprites, pixel art, 3D, animations that need art files, sound packs
- A mouse-only game that drops typed commands
- “The browser decides if I hit” (the **server** is in charge)
- Rebuilding login, the database, or a second game
- Doing the whole future roadmap in one pitch

Your teacher’s example: **semantic colour**. Combat, quests, items, and system lines could use meaning-colours **and** words. Colour must never be the only clue. Someone who cannot see colour, or uses a screen reader, must still understand.

---

## Constraints Gemini must obey

- Keep the classic typed command line.
- One idea. Small enough to explain in a page.
- No code in the draft you will submit.
- No new art assets.
- Do not change who is allowed to invent game outcomes (server, not the page).
- Accessibility: if you use colour, italics, or bold, also use words or labels.
- School-appropriate. Original. No copying another commercial game’s names or plot.
- Classroom nicknames only. No legal names.

---

## What the Classroom post must contain

Use these headings. Prose only.

1. **Team** — classroom nicknames, not legal names.
2. **What we played** — two or three sentences. Rooms and commands you actually used.
3. **Observed problem** — what was hard, unclear, empty, or easy to miss.
4. **Evidence** — specific moments (for example: “After `attack dummy` the hit line looked like `look`.”).
5. **User story** — `As a Collegian, I need … so that …`
6. **Hypothesis** — `We believe … will help players …`
7. **Proposed design** — what the player would see and type. No code.
8. **Non-scope** — at least two things you are **not** doing (graphics, extra features, changing commands you do not need).
9. **Accessibility** — how a player still understands this without colour or motion.
10. **How we would know it worked** — what a classmate would notice in play, in ordinary language.

That text is what is marked. /10. Two criteria: **play evidence** and **small design with no code**.

---

## First message

After you upload this file, paste:

```text
You have the Greenwood Collegium team handoff. We already played the live text game.

Help our team write ONE small design-sprint idea to improve what we saw. We will tell you what we noticed after this message.

Rules you must follow:
- No code, no JSON, no file names to create, no HTML or CSS.
- No graphic assets or 3D.
- Keep typed commands.
- Colour or emphasis may never be the only way to understand something.
- Stay inside this game as it exists, not a different MMO.
- Ask us one or two questions if our idea is too big, then shrink it.

Wait for us to describe what we played and what we want to improve. Then draft the ten Classroom headings. We will revise with you at least twice.
```

Then, in your own words, tell Gemini what you explored and which board idea (or your own small idea) you chose.

Turn 2: cut anything too large. Name one thing you will not build.  
Turn 3: read it aloud. If it still sounds like homework filler or like code, make Gemini fix that. Then submit.