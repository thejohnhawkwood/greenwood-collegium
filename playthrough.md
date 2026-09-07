# Classroom playthrough

Teacher-facing. This is how you set up The Greenwood Collegium and walk the first quest with students or your own kids.

You do not need to be a programmer. You do need to be comfortable with a terminal, a browser, and a password manager.

**Never put real student names, invite tokens, bootstrap tokens, or database URLs into chat, email, screenshots you share, or Git.**

---

## What you will have at the end

- A running game in the browser
- A teacher **owner** account (you)
- Optional student accounts for your kids
- A finished first quest: **Arrival at the Collegium**
- A `help` command that lists every word the game understands today

There is no public registration. Students join only with an invite you create.

---

## Choose a path

| Path | When to use | Progress after you close the server |
|---|---|---|
| **A. Guest play (fastest tonight)** | Same computer, development mode, you just want to try the words | Lost. Guests are temporary. |
| **B. Local owner + invites** | Playtest with your kids using real sign-in | Kept until you stop the server, unless you also have working Postgres |
| **C. Live classroom site (Render)** | School machines, progress that must survive overnight | Kept in the classroom database |

Start with **A** if this is your first hour. Do **B** before you invite a class. Use **C** for school.

---

## Path A — tonight, guest play

You need Node 24 and this repository. If those are not installed, follow [`docs/dev/machine-setup.md`](docs/dev/machine-setup.md) first.

1. Open PowerShell in the project folder.
2. Install and start:

```text
corepack pnpm install
corepack pnpm --filter @greenwood/server start
```

3. Open http://127.0.0.1:3000
4. If you see a sign-in page, click **Continue as guest**. Guest play is allowed only on a local development server, not on the live classroom site.
5. You should land in **Lantern Court**. Porter Bramble, a hedgehog in a too-large coat, will greet you and name the first words.
6. Play the Arrival script in [The first quest](#the-first-quest).
7. Up to four guests can play on one local server at once. A fifth connection is refused.

Guest play is perfect for “does this even work?” It is not how you run a class.

If http://127.0.0.1:3000/health/ready returns 503, that is expected when there is no working database. The game can still run in memory.

---

## Path B — teacher owner on this machine

This creates **your** admin account. After that you can mint student invites for your kids.

### 1. Create a local `.env`

In the project folder:

```text
copy .env.example .env
```

Open `.env` in a text editor.

1. Leave `NODE_ENV=development`.
2. Replace `ADMIN_BOOTSTRAP_TOKEN=replace-with-a-one-time-bootstrap-token` with a long private string you invent. Treat it like a password. Example shape: twenty or more mixed letters and numbers. Do not reuse a school password.
3. Do **not** paste a token from the live Render dashboard into this file.
4. Save the file. Never commit `.env`.

If you do not have Postgres running, you can leave `DATABASE_URL` as the example value. The server will keep accounts in memory for this one process. Stopping the server forgets them. That is fine for a family playtest.

### 2. Restart the server

Stop the old process (Ctrl+C) if it is running, then:

```text
corepack pnpm --filter @greenwood/server start
```

Open http://127.0.0.1:3000

### 3. Create the owner

The page heading should say **First-time teacher setup**.

1. Paste the same bootstrap token you put in `.env`.
2. Choose a username you will remember (letters, numbers, underscore, or hyphen).
3. Choose a password of at least 10 characters.
4. Click **Create owner**.

If the owner form is missing, an owner already exists on this server. Sign in with that account, or restart after wiping local memory (stop the process; memory accounts vanish).

You are now the owner. That is the teacher/admin account.

### 4. Invite a child

1. Click **Issue student invite**.
2. A token appears once at the top of the page. Copy it to a scrap of paper or a password manager. Do not screenshot it into a shared chat.
3. Sign out.
4. On **Accept an invite**, paste the token, pick a classroom username (not a real legal name), and a password of at least 10 characters.
5. Click **Create account**.

A second browser, or a private window, lets you stay signed in as teacher while a child accepts the invite.

### 5. Invite another teacher later

Only the owner can click **Issue teacher invite**. Teachers can issue student invites. Students cannot issue invites.

---

## Path C — live classroom site

The public hostname is in [`docs/context/CURRENT.md`](docs/context/CURRENT.md). Setup steps for Render itself are in [`docs/dev/render-setup.md`](docs/dev/render-setup.md).

1. Open the Render dashboard **Environment** page for the web service. Find `ADMIN_BOOTSTRAP_TOKEN` there. Do not paste it into Git or chat.
2. Open the public site. Production does **not** offer guest play.
3. If no owner exists yet, the **First-time teacher setup** form is shown. Use the dashboard token once. The form then disappears forever for that database.
4. Issue student invites in class. Give each student a token privately. They accept it on the sign-in page.
5. If the bootstrap form is missing, the owner already exists. Sign in as that owner.

Students keep Arrival progress after refresh because the classroom database stores quest, experience, and level.

---

## The first quest

Every new character starts in **Lantern Court**. Porter Bramble explains the words. The quest is **Arrival at the Collegium**.

Type each line and press Enter. The `>` is not typed; it is the prompt.

```text
help
help look
look
say hello
take key
north
quests
```

What should happen:

1. **help** lists every command the game understands today, with a short explanation.
2. **help look** explains `look` in more detail. The same pattern works for `say`, `take`, `north`, and the other listed words.
3. **look** describes Lantern Court. This is the first Arrival objective. The automatic first glance when you connect does **not** count; they must type `look`.
4. **say hello** lets Porter (and anyone else in the courtyard) hear them.
5. **take key** picks up the Small Copper Key on the stones.
6. **north** walks into the Great Hall and finishes Arrival.
7. They should see about **10 experience**, **Level 2**, and `quests` should say Arrival is completed.
8. Typing `look` or `say hello` again must **not** grant a second reward.

Optional after Arrival:

```text
south
south
attack dummy
```

or

```text
south
cast ember dummy
```

That is practice combat in the South Orchard. It is not required for Arrival.

---

## Words you can teach

Students can always type `help`. Today the game explains:

| Command | Meaning |
|---|---|
| `look` | Describe this room |
| `say hello` | Speak in the room |
| `north` `south` `east` `west` | Walk, if there is an exit |
| `take key` | Pick up something you can see |
| `drop key` | Put a carried item down |
| `examine porter` | Look closer at a person or thing |
| `inventory` or `i` | What you are carrying |
| `attack dummy` | Practice fight (South Orchard) |
| `cast ember dummy` | First spell, during a fight |
| `help` / `help look` | This list, or one word |
| `quests` | Current tasks |

---

## Classroom habits

- Use classroom nicknames, never legal names, as usernames.
- Show invite tokens on paper or a private screen, not on the projector.
- One owner account. Do not bootstrap a second time on the live site.
- Production has no guest button. If a school laptop shows guest play, you are not on the live site.
- Do not export the production database or paste connection strings into student materials.

---

## If something is wrong

| What you see | Likely cause | What to do |
|---|---|---|
| Page will not load | Server is not running | Start `corepack pnpm --filter @greenwood/server start` |
| No **Continue as guest** | You are on production, or signed-in mode | Sign in, or use a local development server |
| No owner form | An owner already exists | Sign in as that owner |
| Owner form rejects the token | Token does not match the running process | Confirm `.env` (local) or the Render Environment value (live). Restart after changing `.env` |
| “Sign in to enter the Collegium.” | Production socket without a session | Accept an invite or sign in first |
| Arrival does not finish after `north` | They have not typed `look`, `say`, and `take key` yet | Type `quests` and do the remaining line |
| Progress vanishes after refresh | Guest play, or a memory-only local server that restarted | Use Path B or C with a signed-in account |
| `/health/ready` is 503 | No working Postgres | Expected on a laptop without a database. Play still works in memory |
| Fifth guest is refused | Four in-memory guests are already connected | Close a tab, or use signed-in accounts |

---

## After today

Teacher moderation tools (mute, disconnect, disable an account from a classroom panel) are the next product ticket. Until then, the owner can still issue invites and students play in a shared courtyard.

For machine install details see [`docs/dev/machine-setup.md`](docs/dev/machine-setup.md). For the live host see [`docs/context/CURRENT.md`](docs/context/CURRENT.md).
