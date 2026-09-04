# ADR-0009: Health-only deploy in Ticket 001

## Status

Accepted

## Context

PRD 15.1 requires `main` to stay deployable. Ticket 004 owns the Socket.IO command round trip. Ticket 001 would otherwise be a library that cannot run on Render.

## Decision

Ticket 001 includes a thin Fastify process that exposes:

- `GET /health/live` — process is up (200);
- `GET /health/ready` — not ready (503) until database and content exist;
- `GET /version` — safe build and world version only.

Render health checks `/health/live`. Gameplay, sockets, commands, and migrations are out of scope.

## Consequences

The semester Web Service and Postgres can be created from `render.yaml` before the first room exists. Later tickets add behaviour behind the same process. A green health endpoint is not a playable game.
