# 2026-09-03 — Ticket 001 scaffold

## Intent

Install the iteration pillars and an empty TypeScript monorepo so desktop, work laptop, and Render share one stack. No gameplay.

## Machine

Home desktop (`C:\Users\Papa\Desktop\greenwood`), branch `ticket-001-repository-foundation`.

## What changed

- ADRs 0001–0009 accepted.
- Context pack, classroom roles, machine-setup, and Render runbook added.
- pnpm workspace with `apps/web`, `apps/server`, and the four packages.
- Fastify `/health/live`, `/health/ready` (503), and `/version`.
- Vite + React placeholder page.
- CI workflow and `render.yaml` (Blueprint not applied yet).

## PRD / ADR

- PRD Ticket 001, sections 13–15, 26, 28, 34
- ADR-0008 (pillars), ADR-0009 (health-only deploy)

## Classroom note

Students can open the repo and see folders for client, server, engine, and contracts before any room exists. That is the modular monolith, not a finished game.

## Next

1. Review and merge the Ticket 001 pull request (human).
2. Follow [`docs/dev/render-setup.md`](../dev/render-setup.md) to apply the Blueprint.
3. Clone on the work laptop using [`docs/dev/machine-setup.md`](../dev/machine-setup.md).
4. Start Ticket 002 only after those human steps.

## Open questions

- Render region (Oregon unless changed before first apply).
- Exact paid web and Postgres plans chosen in the dashboard.
- Public `onrender.com` hostname, to be written into `docs/context/CURRENT.md` without secrets.
