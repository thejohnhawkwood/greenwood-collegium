# 2026-09-07 — Stale sequence after process restart

## Intent

Fix connected-but-silent commands after a Render deploy. The socket was up; `look` and `help` were accepted and then dropped.

## Machine

Home desktop, branch `fix-stale-sequence-after-restart`.

## What changed

- Server emits `session-hello` with a process boot id on every socket
- Client resets the stored event sequence when that id changes
- An accepted command whose events are older than the stored sequence asks the player to look again

## PRD / ADR

- ADR-0014 (process restart is not a reconnect)

## Classroom note

The courtyard counts events from one. After the school building restarts, the count starts from one again. The browser must forget the old count or it will ignore the new words.

## Next

Hard-refresh the live site after deploy. Ticket 017 remains the official next Appendix E ticket.

## Open questions

A tab that never receives `session-hello` still needs a second `look` after the restart notice.
