# 2026-09-07 — Ticket 020 Character creation and examine Porter

## Intent

Stop using the classroom username as the character name. After sign-in, a player hears a narrator introduction and chooses a Collegian. `examine porter` must describe Porter Bramble.

## Machine

Home desktop, branch `ticket-020-character-creation`.

## What changed

- Account create no longer mints a hare named after the username
- Character gate: intro, species, gender, suggest or type a name
- Migration 0005: gender, creation_completed_at, unique given names
- Existing accounts finish this once before the courtyard socket opens
- Examine matches fixtures, enemies, items, and nearby Collegians

## PRD / ADR

- PRD 8.4, 9.2, 10.2, Appendix E Ticket 020
- Issues #54 and #55
- ADR-0021

## Classroom note

Hard-refresh the live site. Sign in, finish the Collegian form, then type `look` and `examine porter`.

## Next

Ticket 016: teacher controls and moderation.
