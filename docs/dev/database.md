# Database and persistence tests

Ticket 008 added Drizzle, SQL migrations, and account/character repositories.

## What is persisted

Accounts, characters, sessions, and invites can be written and read back. Guest play remains in development only. Production sockets require a session.

`DATABASE_URL` never goes in Git. Do not paste Render connection strings into chat.

## Default local tests

```text
pnpm test
```

These use the in-memory repositories. You do not need Docker or Postgres.

## CI Postgres

GitHub Actions starts `postgres:18` and sets `GREENWOOD_TEST_DATABASE_URL` to a disposable test database. That runs the same persist contract against Drizzle.

The CI password is only for that ephemeral service. It is not a production secret.

## Optional local Postgres

If you want the SQL tests on a laptop:

1. Run PostgreSQL 18 locally.
2. Create an empty database.
3. Set `GREENWOOD_TEST_DATABASE_URL` in your shell (not in Git).
4. Run `pnpm --filter @greenwood/server test`.

Use a throwaway database. Do not point this variable at Render.

## Production

Render already injects `DATABASE_URL`. The process applies `drizzle/` migrations on start and pings before treating the database as reachable. `/health/ready` reports ready when that ping succeeds and the content loader accepts the room files.
