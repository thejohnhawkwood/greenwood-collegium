# The Defense

- **Series:** event (not a quest, never required)
- **Status:** live
- **Phase id:** `college-defense`
- **Decision:** [ADR-0048](../../adr/0048-college-defense.md)
- **Designer:** Caleb, Deep Dive 01. Queue: [HANDOFF-COCREATED-QUESTLINE.md](HANDOFF-COCREATED-QUESTLINE.md)

Not a quest. There is no giver, no objective list, and no `requiresQuestIds`. A teacher
calls it and the whole college is in it at once.

## What the teacher types

- `admin defense start` — up to 7 minutes, which is also the default
- `admin defense start 3` — a shorter one
- `admin defense cancel` — the adults call it off
- `admin defense status` — phase, minutes left, who called it

All three are audited as `defense`. A student who tries is refused.

## What the student sees

Alder reaches every room at once and is level about it: raiders on the grounds, three
ways in, put the errand down, go to a gate. Then the line that matters in a classroom:
*"Nobody is graded on this. Come back up the path afterward and eat something."*

Anybody who logs in or reconnects while it runs hears him again with the minutes left.

`quests` puts the gates and the clock above the errand list. A quest not yet started
answers with the yard first; a quest already begun still reminds and still progresses.

## The gates

Lantern Court, the East Meadow, the South Orchard. Raiders are minted from
`packages/content/enemies/college-raider.json` at the call: about one per two
Collegians online, spread over three gates, never fewer than three at a gate. Twelve
health, three attack — a first-year can stand one, and a gate is better with company.

They came for the stores. The examine text says so: a pry-bar, a sack, boots for
running, and nothing martial. They will go through a Collegian who is between them and
the stores, which is a different thing from coming for one.

Beating one drops `raiders-token` through the ordinary personal-copy loot path. Every
spawn id carries that night's defense id, so a trophy can only come from the defense it
was won in, and last night's win cannot pay again.

## Afterward

When the clock ends, Flint calls the yard closed in the voice he uses for the end of a
lesson, and the porters finish what is left. Every remaining raider is cleared, so none
outlive the night.

The three gates then carry it in their description: a lantern out and the well cover
propped at Lantern Court, clover trampled flat and the hedge pushed through in the East
Meadow, windfall apples trodden in and a practice stand on its side in the orchard. **No
exit changes.**

## What was cut, and stays cut

The punishment half of the original design. A loss deletes no quest, no ink, no gear, no
progress, and locks no room against the students who turned up. There is no code path in
this feature that removes anything from a character. Offline Collegians are paid nothing
and lose nothing. No Primer ink, ever.
