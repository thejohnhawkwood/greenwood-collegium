# Architecture Decision Records

Use an ADR when a choice is hard to reverse or will shape later tickets.

## Accepted

| ID | Title |
|---|---|
| [0001](0001-modular-monolith.md) | Modular monolith, one origin, one instance |
| [0002](0002-server-authoritative-events.md) | Server-authoritative events; Socket.IO later |
| [0003](0003-pinned-toolchain.md) | Pinned TypeScript toolchain |
| [0004](0004-postgres-and-memory.md) | PostgreSQL 18 on Render; in-memory later |
| [0005](0005-classroom-safety.md) | Classroom safety defaults |
| [0006](0006-classic-interface.md) | Classic interface retained |
| [0007](0007-declarative-content.md) | Declarative JSON world content |
| [0008](0008-iteration-pillars.md) | Iteration pillars and context budget |
| [0009](0009-health-only-deploy.md) | Health-only deploy in Ticket 001 |
| [0010](0010-socket-io-temp-identity.md) | Socket.IO round trip and temporary identity |
| [0011](0011-per-connection-identity.md) | One temporary character per socket |
| [0012](0012-drizzle-repositories.md) | Drizzle repositories and CI Postgres |

## Template

```markdown
# ADR-NNNN: Title

## Status
Proposed / Accepted / Superseded

## Context

## Decision

## Consequences
```
