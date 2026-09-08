# Class-day handoff

For the teacher who will run The Greenwood Collegium with a class and may change the code from student feedback the same hour.

Students **play** on the live site. You **edit** on a laptop clone. Do not merge to `main` while they are playing — a Render deploy restarts the courtyard.

**Never put invite tokens, bootstrap tokens, real student names, or `DATABASE_URL` into Git, chat, or a projector slide.**

---

## Two machines, two jobs

| Machine | Job |
|---|---|
| School browsers | https://greenwood-collegium.onrender.com — sign in, type commands |
| School laptop (this clone) | Git, Cursor, small fixes from what the class notices |

The live site is the last green `main`. Your laptop can be a commit ahead. That is intended.

---

## School laptop, first time

You need a GitHub account that can **push** to [thejohnhawkwood/greenwood-collegium](https://github.com/thejohnhawkwood/greenwood-collegium) (the owner account, or a collaborator). The repo is public, so clone works for anyone; push needs login.

### 1. Tools

On Windows, install if missing:

- Git: https://git-scm.com/download/win (leave Git Credential Manager on)
- Node.js **24**: https://nodejs.org/
- Cursor (optional): https://cursor.com

Open a **new** PowerShell after install.

```text
git --version
node -v
```

Expect Node `v24.x.x`.

### 2. Sign in to GitHub on that laptop

1. In the browser, sign in to GitHub as the account that owns or can write this repo.
2. In PowerShell, either:
   - clone with HTTPS and let Git Credential Manager open a browser when you first `git push`, or
   - `gh auth login` if GitHub CLI is installed (HTTPS, login in the browser).

School networks often block SSH. Prefer HTTPS.

### 3. Clone

```text
cd %USERPROFILE%\Desktop
git clone https://github.com/thejohnhawkwood/greenwood-collegium.git
cd greenwood-collegium
git checkout main
git pull
```

Do **not** copy a home-desktop `.env` that ever saw Render secrets. If you want a local server later:

```text
copy .env.example .env
```

Use only the example placeholders. Students still play on the live URL.

### 4. Install (optional during class)

You can edit content without a full install. To run tests or a local server:

```text
corepack pnpm install
corepack pnpm typecheck
corepack pnpm test
```

If Corepack is blocked, see [`docs/dev/machine-setup.md`](../dev/machine-setup.md).

---

## How to branch (use this)

`main` is the live courtyard. One dated class branch holds every in-period fix.

```text
git checkout main
git pull
git checkout class-2026-09-08
```

If that branch is not on the laptop yet:

```text
git fetch origin
git checkout class-2026-09-08
```

If Git says the branch does not exist, create it once from current `main`:

```text
git checkout main
git pull
git checkout -b class-2026-09-08
git push -u origin class-2026-09-08
```

During class:

1. One issue-sized change (wording, a room line, a help sentence, a bug).
2. `git add` only those files. Never add `.env`, CSVs of tokens, or student lists.
3. Commit with a short why: `git commit -m "Clarify Porter's first greeting."`
4. `git push`

After class (or that evening), open a pull request from `class-2026-09-08` into `main`. Wait for the green CI check. Then merge. Render deploys `main` and **restarts** the process. Do that when the class is not mid-fight.

Do **not** start Ticket 019 (colour) from student feedback unless you meant to leave classic text-only mode.

### Why not commit straight to main?

A push to `main` that passes CI deploys. Deploy restarts the Node process. In-memory mute clears. Students reconnect. Save that for after the bell.

### Why not a new branch per shout?

You will be standing at the front. One `class-2026-09-08` branch is easy to find on both laptops. Split a second branch only if two people edit at once.

---

## During the period

1. Confirm https://greenwood-collegium.onrender.com/health/ready shows `{"status":"ok"}`.
2. Sign in as teacher. Issue unused student invites if needed. Hand tokens privately — not on the projector.
3. Keep the Render **Logs** tab on a side screen. See [`docs/ops/load-test.md`](../ops/load-test.md).
4. Students: accept invite → Collegian form → Lantern Court → Arrival (`help`, `look`, `say hello`, `take key`, `north`). Each Collegian has their own copper key. Full script: [`playthrough.md`](../../playthrough.md).
5. When someone notices a real problem, write it down, then fix it on `class-2026-09-08` on the laptop. The live site will not show that fix until you merge after class.

---

## What not to do

- Do not merge to `main` while thirty browsers are connected.
- Do not run the 30-client load script against Render.
- Do not commit invite tokens or a class CSV.
- Do not paste the Render environment page into chat or a student machine.
- Do not enable public registration.
