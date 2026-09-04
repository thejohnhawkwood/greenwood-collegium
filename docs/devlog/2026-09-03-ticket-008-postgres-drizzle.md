# 2026-09-03 — Ticket 008 PostgreSQL and Drizzle

## Intent

Persist account and character records through repositories and a versioned SQL migration.

## Machine

Home desktop, branch `ticket-008-postgres-drizzle`. CI uses a disposable Postgres 18 service.

## What changed

- Drizzle schema for accounts and characters
- Committed SQL migration in `drizzle/`
- In-memory and Postgres repositories with one persist contract
- Server migrates and pings when `DATABASE_URL` is present
- `/health/ready` can drop `database unwired` after a successful ping

## PRD / ADR

- PRD Appendix E Ticket 008, sections 18.1 and 18.3
- ADR-0004, ADR-0012

## Classroom note

A repository is a promise: create, then read back. The memory version proves the promise on a laptop. CI proves the same promise against PostgreSQL.

## Next

Ticket 009: classroom authentication.

## Open questions

Guest play is still in memory. Auth will be the first writer of real accounts.
