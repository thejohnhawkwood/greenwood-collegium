# Machine setup (desktop and work laptop)

Both machines clone the same GitHub repository. They must use the same Node and pnpm versions. They must **not** share a production `.env`.

## What you need

- Git
- Node.js 24 (this repo pins 24; desktop currently has 24.19.0)
- GitHub access to `thejohnhawkwood/greenwood-collegium`
- Cursor (optional, but this is the primary editor)

You do not need Render credentials on the work laptop.

## 1. Install Node 24

Windows (desktop or school laptop):

1. Install from https://nodejs.org/ (24 LTS) or use `nvm-windows` / Volta if you already manage versions.
2. Open a new terminal.
3. Confirm:

```text
node -v
```

Expect `v24.x.x`.

## 2. Clone

```text
git clone https://github.com/thejohnhawkwood/greenwood-collegium.git
cd greenwood-collegium
```

Any local path is fine. The home desktop copy lives at `C:\Users\Papa\Desktop\greenwood`.

## 3. Enable pnpm via Corepack

```text
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm -v
```

If `corepack enable` fails with a permissions error (common on Windows when Node is in `Program Files`), skip it. Use `corepack pnpm` in place of `pnpm`. Root scripts already do that.

If Corepack is blocked on a school image, install the same pnpm version another approved way and stop if the version does not match `package.json` `packageManager`.

## 4. Local environment

```text
copy .env.example .env
```

On macOS or Git Bash: `cp .env.example .env`.

These values are local placeholders. Do not paste Render `DATABASE_URL`, `SESSION_SECRET`, or `ADMIN_BOOTSTRAP_TOKEN` into this file or into chat. Default tests use in-memory repositories; see `docs/dev/database.md` if you want a local Postgres.

## 5. Install and verify

```text
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

All four must pass. If `pnpm install` wants to change `pnpm-lock.yaml`, stop and ask — the lockfile is the source of truth.

## 6. Run the health process

```text
pnpm --filter @greenwood/server start
```

Open http://localhost:3000/health/live — expect JSON `{ "status": "ok" }` (or equivalent).

Open http://localhost:3000/health/ready — expect **503** `database unwired` when `DATABASE_URL` is unset. Content can still load from `packages/content/rooms`.

Local `NODE_ENV` is not production, so guest play still works. Production on Render requires sign-in.

## 7. Open in Cursor

1. File → Open Folder on the clone.
2. Start a new chat.
3. Read `docs/context/CURRENT.md` first.

## Parity checklist

- Same `pnpm-lock.yaml` as `origin/main`
- Node 24
- Local `.env` from the example only
- No `student-data/`, dumps, or Render secrets on disk inside the repo
