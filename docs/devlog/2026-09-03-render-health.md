# 2026-09-03 — Render health-only Blueprint

## Intent

Apply the Ticket 001 Blueprint and prove the public process is up.

## Machine

Render, Oregon. Confirmed from the dashboard by Philip.

## What changed

- Blueprint synced: web service `greenwood-collegium`, database `greenwood-collegium-db`.
- Public checks (no secrets):
  - `GET /health/live` → 200 `{"status":"ok"}`
  - `GET /health/ready` → 503 `database unwired`, `content absent`
  - `GET /version` → 200, `worldVersion` `0.0.0`

## PRD / ADR

- PRD section 26
- ADR-0009 health-only deploy
- ADR-0004 Postgres 18 on Render

## Classroom note

The live URL is not the game. It only answers whether the Node process is running. `/health/ready` is supposed to fail until later tickets wire the database and content.

## Next

1. Confirm the database **Info** page major version is 18 (the project list can show a different number).
2. Clone and verify on the work laptop.
3. Then Ticket 002.

## Open questions

- Dashboard list showed a Postgres version other than 18. Major version cannot change after create. Confirm before any schema work.
