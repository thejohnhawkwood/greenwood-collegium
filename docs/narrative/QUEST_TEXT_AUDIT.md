# Quest text audit

Standard: [`GREENWOOD_NARRATIVE_STYLE_GUIDE.md`](GREENWOOD_NARRATIVE_STYLE_GUIDE.md).
Reading copy of the live text: [`../content/QUEST-AND-DIALOGUE.md`](../content/QUEST-AND-DIALOGUE.md).

The pass is sliced. Mechanics are never changed by a text slice: quest ids,
`giverNpcId`, `requiresQuestIds`, objective ids, `kind`, `targetId`, `roomId`,
rewards, enemy stats, and NPC ids all stay as they are.

| Slice | Scope | Status |
| --- | --- | --- |
| 1 | Author notes stripped from player text; twelve lesson quests rewritten | Done, 24 September 2026 |
| 2 | Side-hub voices: Hobb, Sile, Kern, Marram, Nett, Midge and their seven quests | Not started |
| 3 | Third lessons, and the remaining college loop text | Not started |
| 4 | Item and fixture descriptions, reward items, the twenty new river and moor fixtures | Not started |
| 5 | Spine continuity: Alder, Wren, Piper, the bell chain, Colm under the barrow lip | Not started |
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

**Interface talk inside speech.** `Defeat the hearth dummy in this room — not
Flint's orchard dummy` was a parenthetical aimed at a player reading a UI. The
disambiguation is still needed and is now something the mentor says in their own
voice: `mine, the one in here, not the one Flint keeps out in his orchard.`

**Simile habit.** `the way weather keeps a gate`, `the way a door waits`, `the way
wool holds rain`, `as if it paid rent`, `as if a partner might still fill it`.
Replaced with physical fact. New text avoids `the way X` and `as if` entirely.

**Weak completions.** `The second hearth lesson is done.` told the player a state
machine had advanced. Completions now show the mentor doing something with the
book and saying one line only they would say.

## Deliberately not changed in slice 1

**Colm under the barrow lip** (`barrow-mouth`, fixture examine) contains `Do not
invent a fight you already missed`, which is an author note. It is left for slice
5 so the named loss is rewritten with the whole East Watch chain in view. It is
the only known author note still shipping.

**Wren's fold node** (`wren-croft`) still says a mist-crow has been sitting the
rail `as if it paid rent`. It is a simile, not an author note, and Wren is a slice
5 character, so it waits for that pass with the rest of her chain.

**Porter Bramble and Instructor Flint** keep explicit `type` instructions in
speech. Both are teaching the interface on purpose; Porter owns Arrival and Flint
owns practice. That is design, not a defect.

## Quest design recommendations, not implemented

These change content structure or mechanics and are recorded for a later decision.

**Fake choice in Porter's nag nodes.** Each of `nag-look`, `nag-speak`,
`nag-take`, and `nag-arrive` offers `I am working on it` and `Please stop
following me`, and both go to `nag-persist`. Two options, one outcome. The opening
three choices are real and should stay.

**The river chain is fetch-shaped.** `the-cut-painter` → `the-biscuit-crate` →
`the-kept-whistle` → `the-black-mooring` is examine, fight, examine, fight,
examine, fight, boss. It works and it gates nothing, but no stage complicates the
one before it. A single discovery partway — the store door opened from inside, for
instance — would make the camp a conclusion rather than a fourth stop.

**The east side never pays Hobb, Sile, and Kern off together.** Three separate
people report three separate wrong things on the same moor and never compare
notes. A closing beat where one of them mentions another's finding would make the
side chain feel like one moor instead of three errands.

**Race-pike has no reason to exist.** It is a foe with loot and no quest, no
giver, and nothing that refers to it. Either something on the river should want
the race running, or it can stay as ambient danger; right now it is neither.

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
