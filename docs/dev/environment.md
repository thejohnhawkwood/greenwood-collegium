# Environment variables

Names and purpose only. Copy [`.env.example`](../../.env.example) for a laptop. Production values live in the Render dashboard. Never commit a real `.env` or paste `DATABASE_URL`, session secrets, invite tokens, or bootstrap tokens into Git or chat.

| Name | Purpose |
|---|---|
| `NODE_ENV` | `production` on Render. Guest play is off when this is production. |
| `NODE_VERSION` | Render Node 24. Also pinned in `.nvmrc`. |
| `HOST` | Bind address. Render uses `0.0.0.0`. |
| `PORT` | Render injects this. Local default is `3000`. |
| `DATABASE_URL` | Postgres connection. Render injects it from the Blueprint database. Required to start production. |
| `SESSION_SECRET` | Signs session cookies. Render generates it. |
| `ADMIN_BOOTSTRAP_TOKEN` | First owner setup. Render generates it. Read it only from the dashboard. |
| `CLASSROOM_MODE` | Production default `true`. |
| `PUBLIC_REGISTRATION` | Must stay `false`. |
| `ALLOWED_ORIGINS` | Browser origins for the socket. Include the public `https://….onrender.com` host. |
| `LOG_LEVEL` | `info` in production. |
| `WORLD_VERSION` | Safe label on `/version`. |
| `RAW_COMMAND_RETENTION_DAYS` | How long raw command text may be kept. |
| `CHAT_RETENTION_DAYS` | How long room chat may be kept. |
| `GREENWOOD_TEST_DATABASE_URL` | Disposable CI or laptop Postgres for SQL tests. Never Render. |

`RENDER_EXTERNAL_URL` is injected by Render. The process also allows that origin for sockets.

See [`render-setup.md`](render-setup.md) and [`../ops/backup-restore.md`](../ops/backup-restore.md).
