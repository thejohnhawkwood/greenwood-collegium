# Design Sprints

Each significant interface upgrade starts with a written design sprint. Do not ask an agent to implement a major UI change without a record here and a GitHub issue.

## Planned sprints

| ID | Title | Status |
|---|---|---|
| DS-classic-living-frame | Gold CLI living frame | Complete |
| DS-playtest-followup | Arrival guide after playtest | Implemented locally |
| DS-001 | Semantic colour and message categories | Complete |
| DS-002 | Persistent player status | Complete |
| DS-003 | Command assistance and keyboard workflow | Complete |
| DS-004 | Bag and equipment panel | Complete |
| DS-005 | Quest tracker and journal | Not started |
| DS-006 | Discovered-world minimap | Complete |
| DS-007 | Combat frame | Not started |
| DS-008 | Ember text effect | Not started |
| DS-009 | Magic-school visual grammars | Not started |
| DS-010 | Glyph room renderer | Not started |

Visual-first cycles (Coding 9 Define handoff) are recorded separately:

| Guide | Scope |
|---|---|
| [ds-001-classroom-readability.md](ds-001-classroom-readability.md) | Semantic colour and transcript labels |
| [ds-002-visual-foundation.md](ds-002-visual-foundation.md) | Cycle A play shell and saved appearance |
| [ds-003-world-map.md](ds-003-world-map.md) | Cycle B canonical map and fog of war |
| [ds-004-painted-catalog.md](ds-004-painted-catalog.md) | Painted Collegians, rooms, NPC and object plates |
| [ds-005-lobby-travel.md](ds-005-lobby-travel.md) | Cycle C lobby desk and discovered-path travel |

## Template

```markdown
# Design Sprint DS-___: [Title]

## Status
Proposed / Approved / In Progress / Complete / Rejected

## Release Target

## Owner

## 1. Observed Problem
What happened in actual use?

## 2. Evidence
Commands repeated, errors, observations, playtest notes, screenshots, or feedback.

## 3. User Story
As a [user], I need [capability] so that [benefit].

## 4. Hypothesis
We believe [change] will improve [measurable outcome].

## 5. Constraints
Keyboard, classic mode, accessibility, screen size, server authority, privacy, time.

## 6. Proposed Design
Describe the interface and interaction.

## 7. Alternatives Considered

## 8. Scope

## 9. Non-Scope

## 10. Data and Event Changes
New event fields, snapshots, preferences, or schemas.

## 11. Accessibility Review
Colour, keyboard, focus, motion, screen reader, text fallback.

## 12. Acceptance Criteria

## 13. Test Plan
Unit, contract, integration, E2E, manual.

## 14. Implementation Summary

## 15. Before-and-After Evidence

## 16. Outcome
Did the hypothesis hold?

## 17. Reflection
What should change next?
```
