# Greenwood narrative

Quest text, dialogue, narration, and the descriptions on rooms, fixtures, items,
and foes. The live text is the JSON under `packages/content/`. These documents are
the standard it is held to and the record of what changed.

| Document | Role |
|---|---|
| [`GREENWOOD_NARRATIVE_STYLE_GUIDE.md`](GREENWOOD_NARRATIVE_STYLE_GUIDE.md) | The standard: register, metaphor budget, voice table for every speaking character, calibration passages |
| [`QUEST_TEXT_AUDIT.md`](QUEST_TEXT_AUDIT.md) | What the six-slice pass found and changed, what was deliberately kept, canon questions |
| [`QUEST_DESIGN_RECOMMENDATIONS.md`](QUEST_DESIGN_RECOMMENDATIONS.md) | Seven problems not implemented, each with its cost and what happens if it is never done |
| [`../content/QUEST-AND-DIALOGUE.md`](../content/QUEST-AND-DIALOGUE.md) | Reading copy of every quest and every speaking character. Regenerate with `node tools/export-quest-text.mjs` |

Story truth lives elsewhere and outranks these files:
[`../content/STORY.md`](../content/STORY.md) is the spine, and
[`../content/quests/`](../content/quests/README.md) holds the storylines.

Two rules worth repeating, because they were the pass's main findings.

**Author notes never ship.** If a sentence is aimed at whoever is editing the file,
it belongs in `docs/`, not in a `dialogue`, `examineDescription`, `introNarration`,
`reminderNarration`, or `completionNarration` field.

**Commands live in objective labels.** Spoken dialogue keeps only the `talk <name>`
a student needs to open a conversation, plus the `ink` instruction on second
lessons. Porter Bramble and Instructor Flint are the exceptions; both teach the
interface on purpose.
