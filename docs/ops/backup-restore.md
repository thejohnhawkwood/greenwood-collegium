# Backup and restore

Human-only. Agents do not run backups, restore production, or read a dump.

The semester database lives on Render Postgres. Accounts, Collegian names, rooms last visited, and unused invite tokens should survive a web-service restart. They will not survive a destroyed database.

## What Render already does

The Blueprint uses a paid, non-expiring Postgres plan. That plan includes managed backups. Open the database in the Render dashboard and use the vendor backup list. Do not paste connection strings into Git, issues, or chat.

## Before a risky migration

1. Confirm CI is green on the commit you will deploy.
2. In the Render dashboard, take or confirm a current backup of `greenwood-collegium-db`.
3. If you also want a copy off Render, export from the dashboard to **teacher-controlled encrypted storage**. Do not leave the file on a shared student machine.
4. Keep the file out of this repository. `.gitignore` already excludes `backups/`, `*.dump`, and `production-exports/`.

## Restore (human)

1. Prefer Render's restore-from-backup on a **throwaway** database first, then compare `/health/ready` and a teacher sign-in.
2. Only after that rehearsal, restore the classroom database. Expect the web service to reconnect; students sign in again.
3. Never hand a production dump to an agent or attach it to a pull request.

## What a restart must keep

A web-service restart (deploy or crash) must keep:

- accounts and hashed passwords;
- Collegian names and rooms;
- unused invite tokens;
- quest and item rows already persisted.

A restart may forget in-memory mute and the in-memory command log. That is expected. See ADR-0014 and ADR-0022.

## What not to do

- Do not commit SQL dumps, CSV class lists, or real chat.
- Do not point `GREENWOOD_TEST_DATABASE_URL` at Render.
- Do not enable public registration to “recover” lost accounts.
