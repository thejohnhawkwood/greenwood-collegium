# Quest text audit

Standard: [`GREENWOOD_NARRATIVE_STYLE_GUIDE.md`](GREENWOOD_NARRATIVE_STYLE_GUIDE.md).
Reading copy of the live text: [`../content/QUEST-AND-DIALOGUE.md`](../content/QUEST-AND-DIALOGUE.md).

The pass is sliced. Mechanics are never changed by a text slice: quest ids,
`giverNpcId`, `requiresQuestIds`, objective ids, `kind`, `targetId`, `roomId`,
rewards, enemy stats, and NPC ids all stay as they are.

| Slice | Scope | Status |
| --- | --- | --- |
| 1 | Author notes stripped from player text; twelve lesson quests rewritten | Done, 24 September 2026 |
| 2 | Side-hub voices: Hobb, Sile, Kern, Marram, Nett, Midge and their seven quests, plus the east-moor closing beat | Done, 24 September 2026 |
| 3 | Third lessons, the six mentor standing lines, and the hearth tree hand-off nodes | Done, 24 September 2026 |
| 4 | Item and fixture descriptions, reward items, the twenty new river and moor fixtures | Done, 24 September 2026 |
| 5 | Spine continuity: Alder, Wren, Piper, the bell chain, Colm under the barrow lip | Text done, 24 September 2026. The page hook below needs an engine decision |
| 6 | Design recommendations written up, nothing shipped | Not started |

## Systemic problems found

**Author notes in player-visible text.** The worst defect, and the reason slice 1
went first. Twenty-four strings across nineteen files contained instructions
written to a writer or an agent. `Solo work.` appeared in eleven of the eleven
enemy descriptions that have one. `He is adult. He is not cute.` was on Hobb and
on Wren. `Not gore, and not a lecture.` was the River Captain. `Do not invent a
second queen on my river.` was Skipper Marram's standing line, spoken to students.
All are now gone except the one noted below.

**Cloned mentor text.** The six first lessons and the six second lessons were each
one template with the mentor's name swapped. Every first lesson opened `Mentor X
keeps the hearth dummy in sight` and closed `X inks the stem at rank I`, and every
second lesson closed `The second hearth lesson is done`. Six mentors were
indistinguishable. Each now has its own action, concern, and closing line.

**One sentence in thirteen places.** All six third-lesson quests and all six
hearth `third-lesson` tree nodes carried the identical sentence `Talk to Headmaster
Alder in the High Study. Type up from the Great Hall. If he is still sending you
down the Clock Tower stair, finish that first.` All six `third-done` nodes were
also word for word the same, including the Holm line. Each mentor now closes their
own hearth with a physical act that marks the end of teaching: Cinder shuts the
grate, Briar hangs the shears and leaves them, Mist opens the double curtain,
Lumen rolls and names your chart, Quern puts his paw back on the keystone, Edge
racks your blade and does not hand you another.

**Mentor standing lines were quest terminals.** Each was `Look around this hearth.
[one aphorism]. Defeat the hearth dummy in this room. Come back and talk to me.`
They now say what the School actually is in one sentence and then invite the
conversation, which is the only command a student needs there.

**Interface talk inside speech.** `Defeat the hearth dummy in this room — not
Flint's orchard dummy` was a parenthetical aimed at a player reading a UI. The
disambiguation is still needed and is now something the mentor says in their own
voice: `mine, the one in here, not the one Flint keeps out in his orchard.`

**Fixtures explaining the game instead of the object.** Found in slice 4 and the
same family of defect as the author notes. A rope coil said `The sentry, if
present, is an adult keeping a gate. Not a classmate.` A biscuit crate said `The
tin that belonged on top is a reward, not a clue you have to guess.` Ditch water
said `This ditch is Kern's errand, not a second queen.` A stile said `Do not skip
her.` All of those addressed the player about structure rather than describing what
is in front of them. Rewritten as physical description that carries the same
information: the willows on the rope island screen the channel, so anyone standing
there can watch the landing unseen.

**Items describing their own mechanics.** The hearth biscuit said `The first lesson
pays in food as well as ink. Eat is not required.` The ink rag said `It does not
raise your health.` The boarding oar said `Wear it in the main paw if you mean
to.` Eight reward items now describe the object and where it came from. The twelve
that already passed were left alone.

**Simile habit.** `the way weather keeps a gate`, `the way a door waits`, `the way
wool holds rain`, `as if it paid rent`, `as if a partner might still fill it`.
Replaced with physical fact. New text avoids `the way X` and `as if` entirely.

**Weak completions.** `The second hearth lesson is done.` told the player a state
machine had advanced. Completions now show the mentor doing something with the
book and saying one line only they would say.

## Deliberately not changed in slice 1

**Colm under the barrow lip** was left for slice 5 and is now done. The author
note `Do not invent a fight you already missed` and the simile `the way weather
keeps a stone` are gone. The facts that matter are kept and made physical: the
coat soaked through to the lining, the open and empty crook-hand, no silk
anywhere, no wounds, the fog moving while he does not, `He is past air`. The
closing instruction is now his shepherd's due rather than a note to the writer:
fold the spare cloak over him, then tell Wren yourself before she hears it from
anyone else. No author note is known to ship anywhere now.

**Wren's fold node** is done. The mist-crow now has three days on the rail and has
worn the moss off it.

**Similes deliberately kept.** Restraint matters as much as removal. `as if the
metal had never left` stays, because Alder is describing a real acoustic fact and
the comparison is the shortest true way to say it. `The flock left as if someone
they knew had opened the way` stays, because that sentence is the horror of the
sheepfold and nothing literal replaces it. Holm's wrapping in `cocoon-nave` stays
whole; it is the other named loss and it already reads correctly.

**Porter Bramble and Instructor Flint** keep explicit `type` instructions in
speech. Both are teaching the interface on purpose; Porter owns Arrival and Flint
owns practice. That is design, not a defect.

## Quest design recommendations, not implemented

These change content structure or mechanics and are recorded for a later decision.

**Fake choice in Porter's nag nodes.** Each of `nag-look`, `nag-speak`,
`nag-take`, and `nag-arrive` offers `I am working on it` and `Please stop
following me`, and both go to `nag-persist`. Two options, one outcome. The opening
three choices are real and should stay.

**The river chain is fetch-shaped.** Partly addressed in slice 2 by text alone.
Marram now compares the two cut rope ends and they match, Nett draws the College
mark before you go and see it, Midge's whistle is sounded up the bank to prove
what it was for, and the final count returns to four boats. The structure is
unchanged, and the remaining recommendation stands: `the-cut-painter` → `the-biscuit-crate` →
`the-kept-whistle` → `the-black-mooring` is examine, fight, examine, fight,
examine, fight, boss. It works and it gates nothing, but no stage complicates the
one before it. A single discovery partway — the store door opened from inside, for
instance — would make the camp a conclusion rather than a fourth stop.

**The east side never pays Hobb, Sile, and Kern off together.** Implemented in
slice 2, with the owner's approval for a content-structure change. Each completion
now hands off by naming the other animal's problem rather than their map position,
and a fourth quest, `one-page-for-three`, sends you back to Hobb and Sile for
dates and has Kern write all three findings on one page. They are the same three
nights. The reward is `fold-tally-page`, which carries that fact in writing. It
requires `the-ninth-scratch` and gates nothing.

**Race-pike has no reason to exist.** It is a foe with loot and no quest, no
giver, and nothing that refers to it. Either something on the river should want
the race running, or it can stay as ambient danger; right now it is neither.

## The fold tally page hook — closed, 24 September 2026

Implemented with the owner's approval for an engine change. `fold-tally-page` is
now recognised by Wren and by Alder, mirroring how Quill recognises the abbey-mark
rubbing.

`tallyPageNode` in `packages/game-engine/src/east-watch.ts` takes an explicit
allow-list of idle nodes and returns `tally-page` only when the character holds
the page **and** the node the NPC would otherwise pick is in that list. Wren's list
is `welcome`, `fork-done`, `stay`. Alder's is `watch-active`, `walker-done`,
`already-chosen`. An allow-list rather than a deny-list means a new spine node can
never accidentally be interrupted by side colour.

Wren reads it twice, puts the kettle down without pouring, and says three animals
who count things properly were all wrong in the same week and none of them came to
her. She does not soften it, and she sends the page up to Alder. Alder holds it
flat under the tuning fork, says Kern does not write a number he cannot stand
behind, and declines to name who carried the bronze in. He keeps the page.

Engine test covers all three cases: the page fires when Wren is idle, the barrow
beat still wins while it is live, and an empty paw returns her to her own node.

## Superseded note: the original hook write-up

`one-page-for-three` ends with Kern tearing the page out and saying that Wren
should see it, and Alder after her if she says so. Nothing in the game answers
that yet. Wren has no line about the page and Alder has no line about it either,
so a student who carries it gets no acknowledgement.

This is **not** text-only, which the earlier note underestimated. Held-item node
selection is engine code, not data: `resolveQuillSpeechNode` in
`packages/game-engine/src/east-watch.ts` checks the rubbing template against the
Collegian's held items and names `abbey-rubbing-kept` itself. Wren and Alder go
through `resolveWrenSpeechNode` and `resolveAlderSpeechNode`, so recognising the
page means editing those functions and adding engine tests. That is a mechanics
change and it is waiting on the owner.

The cheapest honest version is a line on each of them that fires when the page is
held, in the way Librarian Quill already recognises the abbey-mark rubbing. Wren reads three
careful animals being wrong in the same week and does not pretend it is comfort.
Alder puts it beside what he already knows about the bronze and declines to name
a cause from behind a desk, which is his established position.

This would be the first time a side chain feeds the spine, so it needs care: the
page must not skip, gate, or shortcut any part of the East Watch, and it must not
reveal Colm before Wren's own chain does. Text and one dialogue node each. No new
quest, no new objective, no change to any `requiresQuestIds`.

## Canon questions

**Boat count at River Landing.** Marram's new line says four boats were tied there
this morning and three now. That agrees with the empty mooring ring in
`otter-slip` and with the cut painter, but the number itself is new. If the
intended loss is one boat rather than one of four, say so and the line changes.

**Eleven pegs in the Wool Shed.** Also new. Nothing contradicts it.

**Is the bronze inside the Fog Walker audible?** The new examine text says the
note shifts when it moves, which strengthens the existing `used our welcome for a
mouth` line. If the bell is meant to be silent until the hollow, that sentence
should go.
