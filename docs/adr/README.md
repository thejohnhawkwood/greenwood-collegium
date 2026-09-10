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
| [0013](0013-classroom-authentication.md) | Classroom authentication |
| [0014](0014-reconnection-idempotency.md) | Reconnection grace and command idempotency |
| [0015](0015-content-loader.md) | File-per-room content loader |
| [0016](0016-inventory-ownership.md) | Unique item ownership |
| [0017](0017-combat-engine.md) | Server-authoritative combat in the engine |
| [0018](0018-ember-presentation.md) | Ember results are decided before presentation |
| [0019](0019-quest-reward-idempotency.md) | Quest rewards are awarded once and persisted as totals |
| [0020](0020-teacher-invite-roster.md) | Teacher invite roster |
| [0021](0021-character-creation.md) | Character creation after sign-in |
| [0022](0022-teacher-controls.md) | Teacher classroom commands |
| [0023](0023-classroom-roster-and-appearances.md) | Classroom batch invites and Collegian appearance |
| [0024](0024-production-readiness.md) | Production deploy readiness |
| [0025](0025-classroom-load-logs.md) | Classroom load logs and simulation |
| [0026](0026-per-collegian-starter-items.md) | Per-Collegian Arrival keys |
| [0027](0027-classroom-moderation.md) | Classroom approval, moderation and semester speech |
| [0028](0028-semantic-transcript.md) | One evolving semantic transcript; supersedes classic UI retention |
| [0029](0029-authored-npc-adventures.md) | Authored NPC conversations and personal investigation quests |

## Template

```markdown
# ADR-NNNN: Title

## Status
Proposed / Accepted / Superseded

## Context

## Decision

## Consequences
```
