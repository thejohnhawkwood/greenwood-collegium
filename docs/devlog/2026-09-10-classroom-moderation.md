# September 10, 2026 — Classroom moderation and readable transcripts

## Intent

Make the next classroom admission controlled and traceable after the owner's first
thirty-player test. Keep real student identities outside the application, preserve
semester speech privately, and support reading earlier messages without interruption.

## Changes

- Right-hand staff pane with name approval, permanent invite reference/account/character
  mapping, batch invites, account mute/timeout/disable/restore, character removal,
  disconnect, student chat pause, daily speech and recent teacher history.
- Approval binds the submitted names; rejection supports feedback and resubmission.
  Students cannot obtain a play ticket or enter until approved.
- Migration 0007 persists restrictions, realm pause and six calendar months of `say`.
  Recording precedes delivery; command IDs deduplicate retry/fanout. Staff-only reads
  and text exports use no-store responses. Reset retains speech identity snapshots.
- Owner reset previews counts, checks the affected-set revision, then requires
  `RESET STUDENTS`. It removes student accounts, sessions, characters, progress,
  held/personal items and old invites; staff survive.
- Authenticated character requests are throttled by session, login attempts by login,
  with a broader shared-IP burst ceiling for classroom arrival.
- Transcript following respects scroll position and exposes a jump-to-latest button.
  Native selects have explicit contrast. Structured semantic metadata drives grey
  narration, green items, red combat, blue NPCs/players and gold quest text, with
  category labels and safe plain-text fallback.
- The owner retired the separate classic UI requirement. ADRs 0027/0028, the PRD
  amendment, design records, package instructions and teacher runbook reflect that.

## Verification

- Full suite: **224 passing tests**, including the existing 30-player localhost test
  and all eight PostgreSQL persistence tests; none skipped in the configured run.
- Typecheck, ESLint/Prettier, production build and `git diff --check` passed. The web
  suite was rerun after the final session-refresh scheduling adjustment.
- PostgreSQL 18.6 ran in a disposable localhost cluster with fictional data. Migration
  and shared memory/Postgres contract tests covered restriction persistence, rename
  uniqueness, log paging/expiry/deduplication, reset cascades and staff/evidence survival.
- HTTP/socket tests covered unauthorized reads/exports/actions, pending and stale
  approvals, reconnect enforcement, immediate eviction, safe recording failure and
  reset while students were connected. Audit failure after a change still evicts
  affected students; recording failure does not advance the speech quest objective.
- Local browser: rejection feedback → revised submission → approval → entry; timeout
  → waiting screen; readable daily speech and invite references; teacher pane at
  1280 × 720. A 390-pixel embedded app viewport confirmed stacked, reachable controls.
- The prior scroll walkthrough confirmed arrivals/speech preserve older text and the
  jump button restores following. Palette contrast and plain-text safety have tests.
  Native menu popups are omitted by in-app screenshots; school-browser verification
  remains part of the next classroom playtest.

## Release boundary and remaining checks

The changes are local and uncommitted. No production account, invite, speech or secret
was read; no deployment or live reset was performed. Deploy/migrate through the normal
human-controlled process, then follow `docs/classroom/moderation-runbook.md` to reset
and distribute fresh invites. The application cannot recover earlier unrecorded speech.

No new runtime dependency was added. The temporary PostgreSQL server and browser
previews were stopped. Automatic approval review blocked deleting the disposable
PostgreSQL scratch directory in the local user's Temp folder; it contains synthetic
test data only and is outside the repository.

AI disclosure: implementation and tests were prepared with Codex. Include this in any
resulting pull request; human review and deployment remain required.
