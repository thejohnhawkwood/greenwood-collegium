# Quest design recommendations

Written 24 September 2026, at the end of the six-slice narrative pass. Nothing in
this file is implemented. Each item changes content structure, mechanics, or a
surface outside the pass, so each waits on Philip Bird.

The standard is [`GREENWOOD_NARRATIVE_STYLE_GUIDE.md`](GREENWOOD_NARRATIVE_STYLE_GUIDE.md).
What was changed and why is [`QUEST_TEXT_AUDIT.md`](QUEST_TEXT_AUDIT.md).

Each item below says what the problem is, what it would cost, and what happens if
it is never done. Several are fine to leave alone forever.

## 1. Porter's nag nodes offer a choice that is not one

**Where:** `packages/content/rooms/lantern-court.json`, nodes `nag-look`,
`nag-speak`, `nag-take`, `nag-arrive`.

Each of the four offers three options. `What should I type first?` goes to
`commands` and is real. `I am working on it` and `Please stop following me` both
go to `nag-persist`. A student who picks the cheeky option and the patient option
gets the same paragraph, which teaches them that choices in this game are
decoration.

Porter's three opening choices are genuinely different and should stay.

**Cost:** either delete one of the two duplicate options, which is a content edit
and loses a bit of Porter's comedy, or write a second persist node so refusing him
reads differently from stalling. The second is better and is four new nodes.

**If never done:** a first-year learns during Arrival that options can be
cosmetic. That is the worst place in the game to teach that lesson.

## 2. The river chain is still fetch-shaped underneath the prose

**Where:** `the-cut-painter` → `the-biscuit-crate` → `the-kept-whistle` →
`the-black-mooring`.

Slice 2 improved every stage's text. Marram holds the two cut rope ends together
and they match. Nett draws the College mark before he sends you to see it. Midge
sounds the recovered whistle up the bank. The count closes on four boats.

The **shape** did not change: examine, fight, examine, fight, examine, fight,
boss. No stage complicates the stage before it, and nothing a student learns at
step two changes what they do at step three.

**Cost:** one discovery partway. The strongest candidate is the flood store. It is
already a locked cellar that Marram keeps the key to, and the fixture says the
remaining tins are still there *because he locked the hatch*. If the door were
found open from the inside, the chain would stop being a hunt for thieves and
become a question about who on the landing let them in. That is a new objective, a
rewritten `the-kept-whistle`, and a decision about whether the answer is Nett.

**If never done:** the chain reads well and gates nothing. Grade 9 students will
enjoy it. It simply will not surprise them.

## 3. Race-pike is a foe nothing in the world refers to

**Where:** `packages/content/enemies/race-pike.json`, spawned at `mill-race`.

It has stats, loot, lock narration, and victory narration. No quest names it, no
character mentions it, and no objective needs it. Its own examine text has to tell
the player it is optional, which is the tell.

**Options.** Give somebody a reason to want the race running — the mill wheel
fixture already says the axle is packed with reed on purpose, so a working mill is
a real goal. Or leave it as ambient danger and accept that some rooms hold a fight
nobody asked for, which is honest for a wood. Or cut it.

**Recommendation:** leave it. A moor and a river should contain things that are
simply there. But its description should stop apologising for itself, and that is
a text fix somebody could do in ten minutes.

## 4. Alder says he keeps the page, and the student keeps the page

**Where:** `one-page-for-three` reward `fold-tally-page`, and the new `tally-page`
node in `headmaster-study.json`.

This is a mismatch I introduced in slices 2 and 5 and did not resolve. Alder says
`I am keeping this page.` The item stays in the Collegian's inventory, because the
engine has no way for an NPC to take an item back. A student who examines their bag
afterwards will notice.

**Options.** Soften Alder's line so he copies the dates into his own ledger and
returns the page, which is a one-sentence text fix and the cheapest correct
answer. Or add an engine path for an NPC to consume a held item, which is a real
mechanics change and would need care around the unique-item claim.

**Recommendation:** the text fix. Alder copying a date into his own book and
handing the page back is more like him anyway.

## 5. The page node repeats forever

**Where:** `tallyPageNode` in `packages/game-engine/src/east-watch.ts`.

Once the page is held, every idle `talk wren` and `talk alder` opens the page node
again. This matches how Quill's `abbey-rubbing-kept` already behaves, so it is
consistent rather than broken, but both characters will say a one-time-feeling
speech on a loop.

**Cost:** a flag for "has already read this", which means new persisted state. That
is more machinery than the beat deserves.

**Recommendation:** leave it, or rewrite both nodes so they read correctly the
second time. The latter is free.

## 6. `as if` is still common in character-creation appearance text

**Where:** `packages/content/character-creation/appearances.json`, seven instances.

`She looks as if she could cover the orchard in three bounds.` `He looks as if he
would rather be useful than praised.` `She keeps glancing at the rafters as if the
floor were only a suggestion.`

The style guide tells new text to avoid `as if`, and the pass removed it from quest
and room text. Appearance text was left alone on purpose: it is a different surface
with its own job, it is read once at creation, and several of these lines are the
best character writing in the file. The squirrel and the rafters is genuinely good.

**Recommendation:** leave it, and treat appearance text as explicitly exempt in the
style guide rather than as a backlog item. If it is ever revisited, revisit it for
species coverage rather than for similes.

## 7. Spine completions still hand off by naming the next place

**Where:** several of the bell-chain and East Watch quest completions.

Slice 2 fixed this for the six side-hub characters. The spine was not re-cut,
because slice 5 was scoped to Colm, the similes, and continuity. A few spine
completions still end with a direction and a name rather than with a result the
student can see.

**Cost:** a seventh slice over `the-bell-below`, `the-bell-wakes`,
`what-still-sleeps`, and the four Wren quests. Text only, no mechanics.

**If never done:** the spine reads better than it did and is not broken. This is
polish, and it is the obvious place to go next if you want another pass.

## What is explicitly finished

- No author note is known to ship in any player-visible string.
- No two mentors share a paragraph.
- Every quest has an item reward and a completion that shows a result.
- The east moor's three findings meet on one page, and Wren and Alder read it.
- Colm's text keeps every locked fact and no longer instructs the writer.
