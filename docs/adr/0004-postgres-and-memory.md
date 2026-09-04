# ADR-0004: PostgreSQL 18 on Render; in-memory later

## Status

Accepted

## Context

Persistent player state must survive Render restarts. The PRD requires PostgreSQL 18, Drizzle migrations, and an in-memory mode that implements the same repository interfaces for early tests.

Ticket 001 creates the database in the Blueprint so the semester stack exists, but it does not connect to it or write a schema.

## Decision

- Production and semester persistence: Render Postgres 18, paid and non-expiring.
- `DATABASE_URL` is wired by the Blueprint (`fromDatabase`). It never enters Git.
- Drizzle and SQL migrations start at Ticket 008.
- In-memory repositories may appear with the first persistence interfaces. They are never presented as production storage.
- `/health/ready` stays unready (503) until the database is used and content can load.

## Consequences

Applying the Blueprint incurs database cost before gameplay exists. That is intentional: both machines share one real stack, and Ticket 008 will not invent a database under time pressure.
