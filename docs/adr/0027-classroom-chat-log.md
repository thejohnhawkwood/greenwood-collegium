# ADR-0027: Classroom chat log

## Status
Accepted

## Context

Classroom mode must let a teacher review room speech after a live class. Process logs must not record `say` text. The existing audit log is teacher actions only.

## Decision

- Successful `say` lines are stored in `chat_log` for owner and teacher reads.
- The teacher roster table shows recent room chat. Students cannot read `/auth/classroom`.
- Retention follows `CHAT_RETENTION_DAYS` (default 30). Rows older than that are deleted on the next append.
- Process logs still record the verb `say`, never the spoken text.

## Consequences

A teacher can match login, Collegian, and speech without exporting the production database. Chat is not committed to Git. Guests on a local server are logged only while that process is up.
