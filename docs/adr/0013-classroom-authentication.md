# ADR-0013: Classroom authentication

## Status

Accepted

## Context

Ticket 009 must replace temporary identity in production. Public registration stays closed. Accounts already persist (Ticket 008). Guest play is still useful on a laptop without going through bootstrap.

## Decision

- Owner bootstrap uses `ADMIN_BOOTSTRAP_TOKEN` once. Students join only with a one-time invite.
- Passwords are Argon2id. Session and invite secrets are opaque tokens; only SHA-256 hashes are stored.
- The session cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` in production. The client never supplies account, role, or character authority.
- `NODE_ENV=production` refuses guest sockets. Development and tests keep the four-guest pool.
- Repositories stay dual: in-memory for unit tests, Postgres when `GREENWOOD_TEST_DATABASE_URL` or `DATABASE_URL` is set.

## Consequences

The live site requires sign-in. A developer can still type `look` locally without an account. Ticket 010 still owns reconnection after refresh mid-command.
