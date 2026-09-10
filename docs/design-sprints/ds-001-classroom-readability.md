# Design Sprint DS-001: Classroom readability

## Status and owner decisions

Implemented locally; awaiting the next classroom playtest. Owner: Philip Bird.
Related backlog: issue #19. The owner confirmed September 10, 2026 that iteration may
replace the classic UI, accepting the proposed semantic palette and non-colour labels.
No separate UI 0 is required. [ADR-0028](../adr/0028-semantic-transcript.md) supersedes
the previous retention requirement while preserving typed commands and plain narration.

## Problem and hypothesis

In a classroom test with about thirty players, new speech and arrivals pulled readers
away from earlier messages. Native species options had pale text on a white background.
Narration, people, items, combat and quests also needed clearer visual separation.
Keeping an older reading position, providing an explicit jump button, and consistently
marking semantic categories should help students follow both conversation and gameplay.

## Selected design

- Follow new entries while the reader is already at the bottom. Scrolling up suspends
  following; incoming entries show a quiet **New messages** button. Clicking it or
  manually reaching the bottom restores following and hides the button.
- Preserve text selection, keyboard scrolling and focus on incoming messages. The log
  is named and focusable. Resize handling preserves the chosen reading mode.
- Give native selects and their options explicit dark backgrounds and light text.
- Use light grey for narration/room descriptions, green for interactable items and
  command segments, red for combat, light blue for NPCs, a distinct light blue for
  players, and gold for quest events and journals. Visible NPC/PC and category labels
  make distinctions available without relying on colour alone.
- Use engine-provided semantic metadata. Segment text must reproduce narration exactly
  or the client falls back to plain narration. Never infer categories from student speech.
- Keep the staff pane usable beside the transcript, stacking below it on small screens.

## Implementation and verification

`GameTranscript` uses `TranscriptScroll` for follow/unread state and a resize observer.
`SemanticNarration` renders validated event/segment categories; optional `entityKind`
metadata distinguishes NPCs and players. Engine look, examine, inventory, presence,
speech and quest-journal events supply the presentation information. No game rules
move into React and no new dependency is introduced.

Regression tests cover scroll/resize/jump behaviour, focus, log accessibility, escaped
text, category rendering, fallback on inconsistent segments, and palette contrast.
Engine tests verify entity/item tags and narration consistency. The prior local browser
test confirmed that fictional arrivals and speech preserve an older reading position,
then the jump button reveals new messages and disappears. The teacher/student browser
walkthrough checks the approval gate and the sidebar with fictional data.

Native dropdown popups are not included in the in-app screenshots, so inspect the
open species menu on the school browser during the next playtest. The collapsed menu
has been visually checked. Measure classroom readability with students before claiming
an improved learning or moderation outcome.

## Reflection and next iteration

Conditional following supports both reading history and live conversation. Visible
labels supplement the colour palette. The browser transcript remains distinct from
the durable teacher speech record, which is covered by
[classroom moderation](classroom-moderation.md). No deployment or real student reset
was performed as part of this local implementation.
