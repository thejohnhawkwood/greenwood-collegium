# ADR-0027: Classroom approval, moderation and semester speech

## Status

Accepted by the owner, September 10, 2026. Implemented locally; production deployment
and the live reset remain human-controlled.

## Context

The first classroom load test reached about thirty students. The teacher needs to
connect their private class list to game accounts, approve names before they become
visible to peers, intervene promptly, and retain readable speech for a semester.
The owner chose a full student reset, six months of speech, and a persistent invite
reference instead of retaining redeemed secret tokens.

## Decision

- Keep real student identities outside the application. Show a permanent invite ID
  beside the unused token, then the accepting account and character. Erase the secret
  token on redemption as before. Reset invalidates all old student invites.
- Store the reviewed submission's revision in `moderation_state`. The revision binds
  the login, character ID, given name, species, gender and submission time. Only a
  matching approval admits a student; rejection allows that account to resubmit.
  Staff do not need approval. Existing completed students become pending until
  reviewed or deleted through the owner reset.
- Persist mute and timeout expiry against the account, plus a realm chat-pause flag.
  Mute/pause blocks `say`, timeout blocks play, disable revokes access, and character
  removal deletes that character's progress/items while keeping the login. Disconnect
  alone allows a later reconnect. Staff are protected from student moderation actions.
- HTTP controls and typed staff mute use the same application service. Every command
  rechecks current admission and access. Disconnect affected sockets immediately for
  timeout, disable, removal and reset. Auth writes, classroom writes, joins and commands
  share the single server's operation queue. This is not a multi-instance design.
- Store each accepted authenticated `say` in `speech_log` before delivering it. A
  unique `(account_id, command_id)` index deduplicates retries. Snapshot names, IDs,
  invite reference, room and server time. Do not foreign-key these evidence fields to
  deletable accounts. Guests are a local-development feature and are not recorded.
- Retain six calendar months, using UTC instants for expiry and America/Edmonton for
  class-day selection. Filter expired records from reads immediately; prune at startup
  and hourly. Staff can page chronologically and export the selected day as plain text.
  Responses are private/no-store. Runtime speech, exports and the teacher's identity
  mapping are never repository content or process logs.
- An owner reset first previews counts and a revision of the affected IDs. Execution
  requires that revision and `RESET STUDENTS`. Delete all student accounts, sessions,
  characters, quests, held/personal items and student invites in one database transaction.
  Preserve owner/teacher accounts, staff invites, shared world content, and retained
  speech/audit snapshots. Purge matching live character/item/quest state too.
- Keep a separate teacher action history. If its write fails after a moderation change,
  the request reports failure and instructs a refresh, but the already-applied restriction
  and necessary disconnect still take effect. Speech write failure rejects the speech
  without broadcasting it. Reset data deletion is transactional; audit append is separate.
- Shared school IPs get a broader burst limit; login guesses remain limited per login
  and authenticated character requests per session. Client-supplied roles are ignored.

## Consequences

Migration `0007_classroom_moderation.sql` is required. PostgreSQL remains mandatory in
production; memory mode is explicitly labelled temporary. Existing speech from before
this feature cannot be reconstructed. Exported files and database backups have their
own retention outside the live-table cleanup; teachers/operators must manage them.
There is no identity upload field, automatic content judgement, private messaging, or
realm-wide student broadcast channel in this slice.

The shared repository contract tests run in memory and against a dedicated PostgreSQL
test database. HTTP/socket tests exercise role boundaries, stale approvals, reconnects,
deduplication, recording failure and connected resets. See the
[teacher runbook](../classroom/moderation-runbook.md) for rollout and reset.
