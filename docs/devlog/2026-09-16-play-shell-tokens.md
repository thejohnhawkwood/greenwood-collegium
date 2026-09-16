# 2026-09-16 — Play-shell tokens and Collegian chrome

## Intent
Finish the painted play shell so room interactions match the Collegian doll:
unique NPC and object plates, Health/Focus on the portrait, and a click-zoom
of the full artwork.

## Machine
Desktop.

## What changed
- Unique Gwelf/Potter plates for six speaking NPCs, the practice dummy, every
  room object fixture, and the five takeable items.
- Clicking an NPC or object zooms the full punched plate to Collegian-portrait
  size in the top-left of the room painting. Objects examine only; people still
  get Examine / Talk / later duel.
- Health and Focus overlay the bottom of the Collegian frame. Name, level, and
  XP stay underneath. Minimap and NESW stay on-screen without scrolling the
  left column on a desktop play shell.
- Magenta chroma key punched from all NPC and object plates. Generated plates
  used a slightly greener pink than `#DB0068`, so the first key missed them.

## PRD / ADR
[ADR-0030](../adr/0030-visual-foundation.md),
[ADR-0032](../adr/0032-painted-catalog.md),
[DS-002](../design-sprints/ds-002-visual-foundation.md),
[DS-004](../design-sprints/ds-004-painted-catalog.md).

## Classroom note
Open `/?shell=1` and click Headmaster Alder. Then walk the live Great Hall and
compare the zoomed plate to `examine alder`.

## Next
Human confirm the live Render deploy. DS-001 colour and lobby travel shipped
in [lobby-and-colour](2026-09-16-lobby-and-colour.md).

## Open questions
A few object plates still include incidental text from generation. Retake any
token that reads as a sign rather than a prop.
