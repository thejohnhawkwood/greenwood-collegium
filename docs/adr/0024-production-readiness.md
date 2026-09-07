# ADR-0024: Production deploy readiness

## Status

Accepted

## Context

Ticket 001 shipped a health-only Blueprint. The courtyard now plays from `main`, but a deploy still migrated only as the process started, Render checked `/health/live`, and a failed database could fall back to memory. Ticket 017 must make restart predictable.

## Decision

- `render.yaml` runs `db:migrate` as `preDeployCommand` before traffic moves.
- Render health-checks `/health/ready`.
- Production refuses to start without a reachable Postgres. Memory repositories stay for local development and tests.
- Backup and restore stay human-only. Dumps never enter Git or agent context.

## Consequences

A bad migration cancels the deploy instead of seating class in a forgotten memory courtyard. `/health/live` remains for process liveness. ADR-0009 still describes the Ticket 001 health-only start.
