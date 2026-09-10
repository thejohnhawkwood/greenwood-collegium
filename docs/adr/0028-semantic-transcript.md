# ADR-0028: One evolving semantic transcript

## Status

Accepted by the owner, September 10, 2026. Supersedes ADR-0006's requirement to retain
a separate classic interface, as well as conflicting language in the original PRD.

## Context

The owner wants iteration to replace the interface where useful, with a familiar RPG
colour language. Students also need to read earlier events without new speech or
arrivals pulling them back to the bottom.

## Decision

- Keep one typed-command interface. Keep complete plain-text event narration, but do
  not maintain a separate UI 0 or classic-mode selector.
- Narration and room descriptions are light grey. Interactable item/command segments
  are green, combat red, NPC names light blue, player names a different light blue,
  and quest events/journals gold. Palette choices are original CSS values, not assets.
- Add optional `entityKind` metadata to semantic segments. The engine classifies NPCs,
  players and items; the browser never guesses categories by searching speech strings.
  Render segments only if their concatenation exactly matches the plain narration.
  Unknown or missing metadata remains readable plain text.
- Add visible NPC/PC and event-category labels where needed so colour is not the only
  cue. Verify text contrast against the dark transcript well.
- Follow incoming entries only while the reader is at the bottom. Preserve an older
  position and show a quiet new-messages button until the reader jumps or scrolls to
  the end. No smooth scrolling or focus changes on incoming events. Keep the transcript
  focusable and selectable; clicking it must not steal focus into the command input.
- Set explicit light text and dark backgrounds on native selects and options.

## Consequences

No new dependency or engine outcome is introduced. Existing narration render helpers
remain useful for plain-text fallback and regression tests. Room/entity/item metadata
is presentation evidence, not client-side authority. The
[DS-001 record](../design-sprints/ds-001-classroom-readability.md) captures acceptance
and the next classroom playtest.
