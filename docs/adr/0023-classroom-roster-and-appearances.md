# ADR-0023: Classroom batch invites and Collegian appearance

## Status

Accepted

## Context

A teacher needs a paper table of unused tokens, then later the login beside the name the student picked. Look and examine showed people as a name only. Character creation offered a third gender that the class will not use.

## Decision

- Student invites may be created in a counted batch. Unused tokens stay on the roster until used.
- The roster and `admin roster` show login, Collegian name, and status. Remove disables the account.
- Appearance text is declarative, keyed by species and female or male. The engine only prints what join attached.
- New Collegians choose female or male. Existing stored values other than those two use a species-only fallback.

## Consequences

A class list can be filled in one click. Look and examine describe Porter, the dummy, and other Collegians in plain text.
