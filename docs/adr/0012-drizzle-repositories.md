# ADR-0012: Drizzle repositories and CI Postgres

## Status

Accepted

## Context

Ticket 008 must persist accounts and characters. Local `pnpm test` must still pass without a laptop database. Production remains Render Postgres 18.

## Decision

- Schema and SQL migrations live in the repository (`drizzle/`).
- Repositories share one interface. In-memory implementations run in every test suite.
- Postgres implementations run only when `GREENWOOD_TEST_DATABASE_URL` is set. CI provides a disposable Postgres 18 service with that name.
- The live process migrates and pings when `DATABASE_URL` is present. It never logs the connection string.
- Guest gameplay stays in memory in development. Ticket 009 requires a session in production.

## Consequences

CI proves the SQL path. A developer without Docker still has a green unit suite. `/health/ready` can drop `database unwired` after a successful ping. After Ticket 011 it can report ready when content also loads.
