# 2026-09-07 — Ticket 017 production readiness

## Intent

Make `main` deploy predictably and survive a restart. Also let a teacher type how many student invites to mint without a dropdown that closes on the painted frame.

## Machine

Home desktop, branch `ticket-017-production-readiness`.

## What changed

- `render.yaml` runs `db:migrate` before start and health-checks `/health/ready`
- Production exits if Postgres is missing or unreachable
- Backup and environment notes
- Student invite count is a number field

## PRD / ADR

- PRD Appendix E Ticket 017, section 26
- ADR-0009, ADR-0004, ADR-0024

## Classroom note

The school building must be ready before the class walks in. `/health/ready` is that door. A backup is a teacher job, not a student file in Git.

## Next

Ticket 018 classroom load test, only if the owner says next.

## Open questions

Render must pick up the Blueprint `preDeployCommand` and health path from `main`. Confirm those two fields in the dashboard after merge if a deploy looks skipped.
