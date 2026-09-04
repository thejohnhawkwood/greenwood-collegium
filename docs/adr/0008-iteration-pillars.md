# ADR-0008: Iteration pillars and context budget

## Status

Accepted

## Context

Work happens on a home desktop and a work laptop, often in a new Cursor chat. Rereading the full PRD every session wastes context and invites drift.

## Decision

Every session starts from a small set of pillars:

1. `docs/PRD.md` — product law.
2. `docs/adr/` — decisions that change how we build.
3. `docs/context/CURRENT.md` — first file to read; active ticket and forbidden work.
4. `docs/devlog/` — chronological public journal for humans, students, and agents.
5. GitHub issues — Appendix E tickets; work stays issue-sized.
6. `docs/classroom/` — roles and contribution ladder.
7. `docs/dev/machine-setup.md` — desktop and laptop parity.
8. `docs/dev/render-setup.md` — human-only Render Blueprint steps.

Agents must not build the entire MUD in one prompt. They must not merge their own pull requests.

## Consequences

A new chat on either machine can resume from `CURRENT.md` plus the latest devlog. The PRD remains the source of truth; these files are indexes, not replacements.
