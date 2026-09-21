# What Still Sleeps

- **Series:** spine (abbey mystery, beat 3 — first true terror)
- **Status:** live JSON; queen **defeat** required
- **Stable id:** `what-still-sleeps`
- **JSON:** [`packages/content/quests/what-still-sleeps.json`](../../../packages/content/quests/what-still-sleeps.json)
- **IDs / exits:** [room-and-quest-summary.md](../room-and-quest-summary.md#what-still-sleeps)
- **Spine:** [STORY.md](../STORY.md)
- **Starts after:** [The Bell Wakes](the-bell-wakes.md)
- **Next:** [College lessons](college-lessons.md) leave / [The East Watch](the-east-watch.md)

20 XP. Item `copied-still-score`. Piper lives. **Keeper Holm** is the named loss.

Write it so a high schooler can see it, name it, and then go eat something warm. Grim ceiling: [STORY.md](../STORY.md) §2.2.

## Live vs canon

Live objectives: examine `object-holm-wrapping`, visit `deep-cradle`, examine `object-still-score`, **defeat** `enemy-silk-queen-deep-cradle`, talk Alder. Visit still cannot enforce party; `minParty: 3` remains the square-up gate. Not complete if you only read the score.

## Continuity stitch

The ledger already says the bronze was taken on a wet night. The cloister already says whoever hung the lantern meant to come back. Name that person: **Keeper Holm**.

The hatchling is not Holm. The queen is not Holm. Holm is a mole who went to do his job.

## Who Holm was (authors only; drip through objects)

Mole, adult, older than Piper. Same poor mending-thread on a grey coat. He trimmed the cloister lantern every evening so the abbey walk would not go dark. When the silk first hummed he put Piper on the gallery crate and went south. He took his lantern-hook on his belt and left the hanging lantern burning. He did not come back.

Students meet him as fixtures. Do not write a talk tree. Do not animate him. Do not make him a silk-child.

## The wrapping (true terror)

Live fixture `object-holm-wrapping` in `cocoon-nave` (so solo students see it before the party room).

**Look:** A silk wrapping the size of a grown mole stands against the south wall, too still.

**Examine (this is the ceiling; do not exceed it):**

The wrapping is the size of a grown mole. It is upright, as if someone sat down to rest and was not allowed to get up. A grey coat shows in two places where the silk is thin — the same poor thread Piper uses on his sleeves. The lantern-hook on the belt is empty. The muzzle is covered. The silk there is pressed flat, neat as a bandage that was not meant to come off, so a cry could not climb the stair. The air is sweet, the same sweetness as the opened husk. There is no blood. There is no need to cut the silk to know he is past air. Piper asked, if you got this far, that you leave him covered.

**What was done (author sentence, not gore):** the queen did not rage. She kept him. She held a working keeper still and counted on him. That is worse than a fight.

**Forbidden:** a face under the silk; wounds; eating; Holm twitching; Holm as a talk target; Holm hatching.

## Still Score and the Deep Cradle

Round silk chamber, warm air, three pulses in the floor. Larger cocoons unopened. One split. A dark, patient shape in the gap.

**Score examine:** A thread-chart is pinned to the silk. Three notes are marked in the same count as the oak. The fourth space is not blank in any way that helps. A wooden coat-button — two holes, grey thread still in one — is pressed into the silk there. It is warm. Alder cannot see this from the High Study. Someone kept time on a living keeper.

Pick the **button**, not a second whistle, so Piper’s whistle stays Piper’s.

**Copied Still Score:** paper copy. Fourth space drawn as a small circle with two dots. You remember the button was warm.

## Queen fight (required in canon)

Spawn `enemy-silk-queen-deep-cradle`, `minParty: 3`, first-timer XP 20, loot `queen-silk-cord`.

- She does not roar like a lesson.
- Threads tighten when a Collegian locks a move.
- The hum counts three.
- Party refuse: “The Silk Queen will not square up for fewer than 3 Collegians. Bring classmates.”
- When she falls: “The Silk Queen folds in on herself. The hum in the floor misses a beat, then goes on without her.” Never “the lesson is over.”
- Do not make her Holm. She is the next mouth. Holm was the meal she did not finish naming.

## Piper after (he lives)

Live talk nodes: `holm-named`, `after-queen`.

**holm-named** (after wrapping examined, even before the fight): he says the name. Holm put Piper on the crate and went south. Piper ran. Leave the wrapping covered. Come back up even if you are angry. The lantern-light from the tower is getting thinner.

**after-queen:** still on the crate. Not alright. He will keep the stair if the class comes by. Do not kill Piper. He is the witness the class needs.

## Alder aftermath (cozy is mandatory)

You name the score, the button, the three who stood, and Holm. Alder listens to the end. The fork answers once. He does not lift it again.

“You did not invent a monster. You finished a lesson I could not fight for you. Holm kept that stair so first-years would not walk it dark. We will keep his name in the High Study. Go to class. Eat something warm. If your paws are shaking, talk to Fen. Then, when you can stand a cold wind, come back. The grounds east of the meadow have their own hunger, and I will not send you still hungry from this one.”

That last sentence is the **only** moor seed here. Full breadcrumb: [college lessons](college-lessons.md) leave, then [East Watch](the-east-watch.md).

**Fen:** honey, rosemary, breathing wheel. Nobody earns extra courage by pretending not to hurt.

**Bramble (optional later node):** the lowest hook on the stair-keepers’ row is empty. No speech.

## What students type

1. `talk alder`
2. Clock Tower `down` `down` `east` `south` — or travel
3. `examine wrapping` (nave)
4. `south` into Deep Cradle
5. `examine score`
6. With two classmates: lock until she falls
7. `talk alder`
8. Optional: `talk piper` again; `talk fen`

Live JSON: wrapping, queen `defeat`, Piper `holm-named` / `after-queen`, Alder sleeps nodes, porter empty hook, reserved `keeper holm`.
