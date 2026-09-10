# ADR-0022: Teacher classroom commands

## Status

Accepted; process-local mute and roster placement superseded by
[ADR-0027](0027-classroom-moderation.md), September 10, 2026.

## Context

Ticket 016 needs announce, inspect, mute, kick, and an audit log so a teacher can run class without editing the database. Role checks already exist on HTTP. Play sockets did not know account role.

## Decision

- `PlayIdentity` includes server-assigned `role` and login `username`. The client cannot claim them.
- Classroom verbs parse in the engine. The server enforces owner/teacher, writes the audit log, and applies mute or kick.
- Mute lives in the running process. A restart clears it. The audit row persists.
- Inspect may show a login name to a teacher. It never shows a password or session token.
- Account disable stays on the teacher roster.

## Consequences

Guests and students who type `admin announce` are refused. Teachers type the same words in the classic prompt. Postgres stores audit rows when the database is up; memory stores keep them for the process.
