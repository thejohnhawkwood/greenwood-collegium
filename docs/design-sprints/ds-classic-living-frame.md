# Design Sprint: Classic living frame

## Status

Complete

## Release Target

v0.0 foundation, classic UI 0

## Owner

Philip Bird

## 1. Observed Problem

The gold typed transcript sits on a bare moss page. Students and visitors do not yet feel they have walked up to the Collegium.

## 2. Evidence

Owner request after Arrival playtest: frame the gold CLI, grow tree boughs on both window edges, and place a Gwelf / Redwall procession of student animals in one corner.

## 3. User Story

As a student or teacher, I need the classic command window to feel like a living academy gate so that the first minute of play matches the story.

## 4. Hypothesis

A decorative wooden-gold frame with painted boughs and a corner arrival scene will increase delight without changing commands, events, or authority.

## 5. Constraints

Typed commands stay canonical. Classic mode remains complete. No Tailwind. No new runtime dependency. Art is decorative. Keyboard, focus, and contrast of the transcript must not worsen. Motion respects `prefers-reduced-motion`.

## 6. Proposed Design

- Full-window shell with painted oak pillars on the left and right edges.
- Bottom-left corner: woodland students arriving at the academy, cut out so only the party and path sit on the forest.
- Gold inner bezel around the existing classic transcript.
- Tree trunks reveal upward from the ground on first paint, without stretching the painting.
- Painted lanterns keep a slow pulse. No vine strokes.

## 7. Alternatives Considered

- Starting DS-001 semantic colour instead: rejected; colour categories are a later sprint.
- Replacing the transcript with a pictorial room: rejected; classic mode must remain complete.

## 8. Scope

Client presentation only. Public frame paintings. CSS bezel and reduced-motion rules.

## 9. Non-Scope

Game rules, HUD, colour-coded message kinds, glyph renderer, Playwright.

## 10. Data and Event Changes

None.

## 11. Accessibility Review

Frame art is `aria-hidden`. Images have empty `alt`. CLI contrast and focus rings stay lantern-on-moss. Growth animation is disabled when the user prefers reduced motion.

## 12. Acceptance Criteria

- Gold command transcript still fills, scrolls, and accepts typed commands.
- Tree boughs occupy the left and right window edges.
- One corner shows student animals arriving.
- Auth gate and play view share the same frame.
- Narrow viewports still leave a usable command column.

## 13. Test Plan

Unit test for public art URLs. Manual browser pass of sign-in and guest command entry.

## 14. Implementation Summary

`AcademyFrame` wraps loading, sign-in, and play. Public paintings supply the oak pillars and arrival corner. CSS draws the gold bezel and a clip-path trunk reveal. Lantern overlays pulse. Growth and pulse are off when the user prefers reduced motion.

## 15. Before-and-After Evidence

Browser check on the local classic client: boughs on both window edges, student animals in the bottom-left corner, gold well around the typed transcript and the teacher sign-in forms.

## 16. Outcome

The hypothesis holds for presentation. Commands and events are unchanged.

## 17. Reflection

Keep DS-001 for semantic colour. This frame must stay optional decoration if a later sprint needs a plainer projector mode.
