# 2026-09-07 — Ticket 016 Teacher controls and examine people

## Intent

Let a teacher run class from the classic prompt without editing the database. Fix examine so Porter, other Collegians, and the Practice Dummy match the way people actually type their names.

## Machine

Home desktop, branch `ticket-016-teacher-controls`.

## What changed

- Examine matches name words, login names, and `x`. Fixtures without extra text still describe. A known person or dummy in another room says they are not here and, for the dummy, points to South Orchard.
- Owner and teacher: `admin announce`, `inspect`, `mute`, `kick`, `audit`
- Audit table `0006_audit_log`. Mute is in-memory.
- Play identity now carries server-assigned role and username

## PRD / ADR

- PRD Appendix E Ticket 016 and §21.2
- ADR-0022

## Classroom note

Hard-refresh. `examine porter` in Lantern Court. `south` then `examine dummy`. Teachers type `admin` for the command list.

## Next

Ticket 017: Render blueprint and production readiness.
