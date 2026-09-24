# Greenwood narrative style guide

Owner: Philip Bird. This guide governs quest text, dialogue, narration, and the
descriptions on rooms, fixtures, items, and foes. The live text is the JSON under
`packages/content/`. This file is the standard that text is held to.

## The register

Grounded, warm, specific, adventurous, slightly old-fashioned, readable by a
Grade 9 student on the first pass.

Rough mix: 70% plain prose with clear actions and concrete detail, 20% material
detail (weather, food, tools, cloth, smells, wear), 10% a strong image where the
scene has earned one.

## Concrete before abstract

Describe what a player could see, hear, smell, carry, count, or repair.

Good: `Eleven oak pegs along the wall, ten of them loaded with wet fleece. The one
nearest the door holds an empty leather bell-loop.`

Bad: `The shed remembers the flock that did not return.`

Numbers and materials do a lot of work. Eleven pegs, four boats, three nights,
brass buttons, lanolin, linseed, a darned thumb.

## Metaphor budget

Most dialogue carries zero deliberate metaphor. Ordinary narration carries very
few. An important scene may carry one image.

Do not write `the way X keeps Y`. Do not write `as if`. Both were stripped from
quest, room, fixture, item, and foe text on 24 September 2026 and should not come
back there.

Two exemptions, both deliberate. `packages/content/character-creation/appearances.json`
keeps its `as if` lines; that text is read once at creation, it is some of the best
character writing in the project, and it is not a backlog item. And a simile stays
anywhere it is the shortest true way to say something: Alder's `as if the metal had
never left` is describing a real acoustic fact, and the sheepfold's `The flock left
as if someone they knew had opened the way` is the horror of that room.

Treat these with suspicion: whispers, echoes, secrets, ancient, forgotten,
shadows, threads, tapestry, song, dance, heart, soul, destiny, something
stirring, memories lingering, the forest remembering, darkness gathering.

## Author notes never ship

The strongest defect found in the first audit was instructions to a writer or an
agent sitting inside text students read. `Solo work.` `He is adult. He is not
cute.` `Not gore, and not a lecture.` `Do not invent a second queen on my river.`

If a sentence is aimed at whoever is editing the file, it belongs in
`docs/content/`, not in a `dialogue`, `examineDescription`, `introNarration`,
`reminderNarration`, or `completionNarration` field.

## Commands live in objective labels

The repo requires every objective to name the next command. That belongs in the
objective `label`.

Spoken dialogue keeps only the `talk <name>` a student needs to open a
conversation, and the `ink` instruction on second lessons, because neither has an
objective to carry it. Everything else — `type north`, `type attack dummy` — stays
in labels or in a mentor who is explicitly teaching the interface, which is
Porter Bramble and Instructor Flint by design.

## Completion must show a result

Weak: `The second hearth lesson is done.`

Better: the mentor does something physical with the book, says one line that is
theirs, and hands it back. The player should be able to tell that the world moved.

## NPC voices

Each recurring character has one thing they are doing and one thing they care
about. Two mentors must never be one paragraph with the name swapped.

| Character | Doing | Cares about | Never |
| --- | --- | --- | --- |
| Porter Bramble | Waiting at the gate, nagging cheerfully | Every first-year finishing Arrival | Gives up following you |
| Headmaster Alder | Sitting behind a blotter with a tuning fork | Facts before conclusions | Trades in rumour |
| Mentor Cinder (Ember) | Banking the grate | Knowing where the fire is before feeding it | Sentiment |
| Mentor Briar (Thorns) | Pruning the trellis | One cut in the right place | Enthusiasm mistaken for skill |
| Mentor Mist (Veil) | Waiting | Not announcing yourself first | Filling a silence |
| Mentor Lumen (Stars) | Writing a column of figures | The bearing before the shot | Wonder before charts |
| Mentor Quern (Stone) | Chalking granite | Feet set before anything else | Hurrying a sentence |
| Mentor Edge (Steel) | Oiling a strap | Naming the stance out loud | Polish for show |
| Instructor Flint | Running orchard practice | Finishing what you started | Pretending practice is the moor |
| Healer Fen | Putting the work down for you | Nobody being brave at her | Shaming an injury |
| Librarian Quill | Marking a gap with one finger | Paper before accusations | Blaming a student |
| Groundskeeper Tansy | Looking before fixing | Not drowning a plant again | Confidence in her own first guess |
| Shepherd Wren | Standing, watching the doorway | The truth about Colm, not a kind version | Being cute about fear |
| Foldhand Hobb | Trimming a lamp, counting twice | Saying a number only when it is right | Naming a walker before Wren does |
| Reedcutter Sile | Cutting reed, knife corded down | The mere going back to being water | Calling it a ghost |
| Stoneward Kern | Chalking fallen lintels | The count being right | Discussing the barrow uninvited |
| Skipper Marram | Wringing out a sleeve | Boats coming back | Calling theft weather |
| Deckhand Nett | Turning an empty cord at his neck | Not carrying other people's tins | Claiming he cut anything |
| Heron Midge | Grounding a fishing spear | A warning that actually sounds | Letting the river keep a boat |

## Terminology

The school is the Collegium. Students are Collegians. A School is one of six:
Ember, Thorns, the Veil, Stars, Stone, Steel. The book is the Field Primer, and
its unit of progress is an **ink** spent on a **vein** of a **leaf**. A fight is
squaring up. A shared fight needs Collegians to **lock** on the same clock.

Do not use franchise names. Do not name a second queen, a second bell, or a
second walker; those are the spine's and they are finished.

## Emotional range

Not every quest is cozy, ominous, or funny. The kitchens memorial, Colm under the
barrow lip, and the biscuit tin are three different registers and all three are
correct. Contrast is what makes the dangerous quests land.

## Calibration passages

Use these as internal reference. They already pass.

- Flood Marker, `river-landing`: the carved instruction about moving books before
  furniture, and the crossed-out suggestion about biscuits. Humour from a real
  object with real use.
- Librarian Quill's standing line: a finger marking a gap, a green lamp circling
  an empty place, `Blame is a poor bookmark.` One image, earned.
- Groundskeeper Tansy on the dead cactus. Character revealed through an admitted
  mistake.
