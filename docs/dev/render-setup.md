# Render Blueprint setup

Human-only. Agents do not create Render resources or handle production secrets.

This applies the root `render.yaml` after Ticket 001 is on `main`. The result is a health-only Web Service and a persistent Postgres 18 database. There is no game yet.

Official docs: [Render Blueprints](https://render.com/docs/infrastructure-as-code).

## Before you start

- Ticket 001 is merged to `main` and CI is green.
- You are logged into Render with a workspace that can pay for **one always-on web service** and **one non-expiring Postgres**.
- GitHub account `thejohnhawkwood` can be connected to Render.
- Do not use the 30-day expiring free Postgres tier.

If any click fails, stop. Do not create a second database by hand or paste `DATABASE_URL` into Git.

## Steps

1. Open [https://dashboard.render.com](https://dashboard.render.com).
2. If GitHub is not connected: **Account Settings → Connect GitHub** (or the GitHub connection prompt) and grant access to `greenwood-collegium`.
3. Click **New**.
4. Click **Blueprint**.
5. Select repository `thejohnhawkwood/greenwood-collegium`.
6. Branch: `main`.
7. Blueprint path: `render.yaml` (repo root).
8. Review the plan preview. You should see:
   - web service `greenwood-collegium`
   - database `greenwood-collegium-db` with Postgres major version 18
9. Confirm the **web** plan is paid and always-on (not an idle-spinning free instance).
10. Confirm the **database** plan is paid and persistent (not the expiring free tier).
11. Confirm **region** (default `oregon`). Change it now if you must; moving later is painful.
12. Apply / create the Blueprint.
13. Wait for Render to generate `SESSION_SECRET` and `ADMIN_BOOTSTRAP_TOKEN`. Do not paste those values into Git, issues, or chat.
14. After the first deploy starts, note the public hostname `https://<name>.onrender.com`.
15. Optional until Ticket 004: on the web service **Environment**, set `ALLOWED_ORIGINS` to that `https://….onrender.com` origin. Leaving `http://localhost:5173` is acceptable for Ticket 001.
16. Wait until the deploy is live.
17. Open `https://<service>.onrender.com/` — expect the foundation HTML page, not a 404.
18. Open `https://<service>.onrender.com/health/live` — expect HTTP 200 and JSON status ok.
19. Open `https://<service>.onrender.com/health/ready` — expect HTTP 503 and an honest reason (`database unwired`, `content absent`).
20. Open `https://<service>.onrender.com/version` — expect a safe version payload, no secrets.
21. Put **only** the public hostname into `docs/context/CURRENT.md`. Open a small docs PR if needed. Never commit connection strings.

## If health/live fails

- Read the Render deploy logs (build command and start command).
- Confirm CI passed on the commit Render deployed (`autoDeployTrigger` is `checksPass`).
- Confirm Node 24 (`NODE_VERSION` / `.nvmrc`).
- Do not add packages or a second service to “make it work” in the dashboard. Fix the repo instead.

## What not to do

- Do not copy the external Postgres URL into `.env` on a laptop unless you are deliberately doing Ticket 008 work, and never commit it.
- Do not enable public registration.
- Do not create a second Blueprint for the same resources.
