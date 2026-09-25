# Shellington

- **Series:** side (never required)
- **Status:** live
- **Stable id:** `shellington`
- **JSON:** [`packages/content/quests/shellington.json`](../../../packages/content/quests/shellington.json)
- **Spine:** [STORY.md](../STORY.md)
- **Play / author:** [adventures.md](../adventures.md)
- **Designer:** Shanayah, Deep Dive 01. Queue: [HANDOFF-COCREATED-QUESTLINE.md](HANDOFF-COCREATED-QUESTLINE.md)

Giver `npc-mentor-lumen` at the Hearth of Stars. Requires `first-lessons-stars`,
so Lumen already knows you. 25 XP. Item `shellington-diary`.

Shellington is a grown otter who borrowed a bearing book in the spring and then
stopped writing to Lumen. He is on the crow-stile past the barrow with something grey
under his fur, answering questions with the wrong answers in the right voice.

## What the student types

`talk lumen` at the Hearth of Stars. East moor to the Barrow Mouth, then `east` to
the Crow Stile. `attack shellington`. Then `talk lumen`.

## Author notes

He is brought back, not buried. The victory text has him sit down hard on the step,
breathing, with the grey going out of his eyes in patches, asking in his own voice
whether he is late for Stars. Lumen sends for Fen before she says anything to the
student, which is the right order and not the polite one.

The drop is certain, not a chance, as the handoff requires. The diary's last two
pages are the payload: the creatures out here do not behave like animals defending a
place, they behave like something is asking them to. And then, dug into the paper:
"It asked me too. I wrote down that I said no."

That line is a hook for later NPC dialogue and is deliberately not answered here.
Nothing in the spine checks this quest.

**Gating note for the owner.** `requiresQuestIds: ["first-lessons-stars"]` means only
Stars Collegians can walk it. That follows the handoff's "if Lumen should already know
you". If you would rather every School could reach it, drop the requirement and Lumen
opens with a stranger's version of the same errand.
