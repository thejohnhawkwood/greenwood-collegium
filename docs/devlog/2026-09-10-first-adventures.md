# September 10, 2026 — First adventures in the existing rooms

Owner request: populate the current map with NPCs, interactions, quests, and richer
descriptions, without adding rooms.

## Changes

All 25 room descriptions now have sensory detail, small jokes, and details to
investigate. Each room has one new examinable fixture. Porter Bramble gains a
conversation; Headmaster Alder, Librarian Quill, Groundskeeper Tansy, Healer Fen,
and Instructor Flint bring the speaking cast to six.

Three new quests join Arrival: The Missing Pages, A Little Room to Grow, and The
Bell Below. Authored conversations introduce their clues, offer reminders, and
respond to a completed investigation. Rewards are 10, 10, and 15 experience.
Clues remain available to every student, with independent saved progress.

The engine interprets `talk <name>`, `talk to <name>`, exact fixture examination,
and objective dependencies. The server persists successful talk and examine
progress before acknowledgement. Dialogue remains private and uses the existing
semantic NPC name treatment; quest completion retains full plain narration.

Content schemas and their editor JSON schemas support optional dialogue, quest
givers, conclusions, fixture targets, and dependencies. Existing Arrival data and
progress rows remain compatible. No database schema changes or dependencies.

## Verification

- Full suite: 227 tests passed; eight PostgreSQL tests skipped because no test
  database was configured for this run.
- Typecheck, lint/format checks, production build, content validation, and
  `git diff --check` passed.
- All three authored routes completed with 30 interleaved fictional characters,
  preserving shared fixtures and awarding each character once.
- Authenticated socket test persisted a clue, restarted the server, completed
  the quest, replayed the turn-in, and restarted again without additional rewards.
  It also checked remote-clue rejection and conversation privacy.
- Compared all room IDs, titles, zones, exits, and map placements with the content
  before this pass: unchanged. Every long description was enriched.

No deployment, production data access, or live reset was performed. Existing
classroom moderation work and the owner's documentation edits remain in place.
The dialogue is a single authored exchange per NPC; branching choices, NPC
movement, and global object transformations are outside this slice.

AI disclosure: Codex authored the implementation, original fictional content,
tests, and documentation in collaboration with the owner.

See [the play and authoring guide](../content/adventures.md) and
[ADR-0029](../adr/0029-authored-npc-adventures.md).
