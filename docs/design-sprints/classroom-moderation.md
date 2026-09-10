# Classroom moderation after the live load test

## Status and evidence

Owner decisions confirmed September 10, 2026. Implemented locally on
`codex/classroom-moderation-sprint`; deployment and the live reset are not performed.
The owner reported about thirty concurrent students and a need for immediate teacher
oversight. This record contains no real student identities or speech.

## Confirmed design

- Staff-only pane in the right tree's space, with approvals, roster/invites, realm
  speech and recent teacher history; a persistent pause/resume student-chat control.
- The teacher keeps their real-name list outside the application and repository.
  Each unused token shows a permanent reference. That reference remains linked to
  account and character after redemption; the used secret token is erased.
- Both login and character name require teacher approval before entry. Rejection
  includes feedback and permits resubmission on the same account. Approval binds the
  exact reviewed submission, preventing stale tabs from approving changed names.
- Account-based mute allows play but blocks speech; timeout blocks play; disable
  revokes access; character removal keeps the login but removes character progress.
  Staff accounts are protected. Restrictions survive restart and reconnect.
- Realm-wide accepted `say` is recorded privately for six calendar months, with an
  Alberta day selector, chronological paging, optional automatic updates and text
  export. Names and invite/account/character IDs are snapshotted for follow-up.
- Owner-only full reset removes all student accounts, sessions, characters, progress,
  held/personal items and old student invites. Staff and retained speech remain.
  Fresh invites are issued after previewing counts and executing `RESET STUDENTS`.

## Implementation and tests

Contracts validate all controls. The auth service owns admission, classroom application
services enforce permissions, repository implementations persist state, and socket
handlers coordinate immediate eviction and recording before delivery. The engine
remains independent of HTTP and persistence. Migration 0007 adds moderation state,
classroom settings and the speech log. No dependency was added.

Tests cover permission boundaries, exact approval revisions, rejection/resubmission,
mapping after token consumption, expiry/reconnect, pause with teacher speech still
available, retry deduplication, record-before-broadcast failure, pagination, retention,
reset preview races, staff/evidence preservation, and a classroom sharing one IP.
The same new persistence contract runs in memory and in the optional dedicated
PostgreSQL test suite. Local browser walkthroughs use fictional accounts only.

## Risks and scope

Runtime speech never goes into process logs, source fixtures or browser storage.
Exported copies and backups need separate retention management. The application cannot
recover speech from before deployment. The server remains a single process; the shared
operation queue is not a distributed locking scheme. Audit writes follow moderation
state changes; an audit outage is reported without undoing a needed disconnect.

The semantic/scrolling design is in [DS-001](ds-001-classroom-readability.md).
[ADR-0027](../adr/0027-classroom-moderation.md) records persistence and enforcement;
the [teacher runbook](../classroom/moderation-runbook.md) explains rollout and reset.
The next classroom playtest should verify the pane on school laptops and whether
teachers can locate an invite, approve names and review an incident quickly.
