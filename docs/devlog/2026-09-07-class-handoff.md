# 2026-09-07 — Class-day handoff

## Intent

Make the next school laptop and a visiting teacher able to run class tomorrow, and give the owner a safe branch for in-period fixes.

## Machine

Home desktop. Docs only. No secrets.

## What changed

- `docs/classroom/class-day.md` — clone, GitHub login, `class-2026-09-08`, do not deploy mid-lesson
- README and playthrough point a visiting teacher at Path C and Arrival
- `class-2026-09-08` will be created from `main` after this lands so the school laptop can check it out

## PRD / ADR

- Classroom playthrough, ADR-0005, ADR-0024, ADR-0025

## Classroom note

Students play on the public courtyard. The teacher’s laptop holds the next commit. Those are different doors.

## Next

Tomorrow: class on Render. Fixes on `class-2026-09-08`. Merge after the bell. Do not start Ticket 019 unless the owner says next.

## Open questions

School images sometimes block Corepack or Node 24. The live site does not need a local server. Clone and Git are enough to record feedback as commits.
