# ADR-0020: Teacher invite roster

## Status

Accepted

## Context

Invite secrets are hashed (ADR-0013). Teachers lose the plaintext after the one-time display, and a memory-only local server forgets unused invites on restart. Classroom playtest needs the issuing teacher to see unused tokens and which username accepted each invite.

## Decision

- Unused classroom invite tokens remain readable by owner and teacher accounts until the invite expires.
- After consume, the teacher roster still includes the issued token, the hash, and the accepting username so a private legal-name list can be joined locally. The game does not store legal names.
- Students never receive tokens or hashes.
- Passwords are never stored in recoverable form and never appear in the roster.
- The roster is an authenticated HTTP read. The client does not invent account or invite state.

## Consequences

Local play still forgets invites when Postgres is down. Render keeps them. Ticket 016 can add mute and kick later without changing this read model.
