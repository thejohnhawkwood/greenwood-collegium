# ADR-0014: Reconnection grace and command idempotency

## Status

Accepted

## Context

Ticket 010 must stop refresh and network retries from applying movement twice. Command IDs already exist. Authenticated characters persist a room id. Guests do not.

## Decision

- The application layer keeps an in-memory command log keyed by character and command id. A repeat returns the first acknowledgement and does not call the engine again.
- Authenticated sockets get a short disconnect grace. A new socket for the same character resumes in place, emits `session.snapshot`, then a `room.snapshot`.
- Guests still leave immediately. Local refresh as a guest may become a new woodland student.
- The command log is process-local. Process restart is not a reconnect.

## Consequences

A replayed `north` cannot walk the character a second time. A signed-in refresh stays in the same room. Ticket 012+ can attach rewards to the same command id.
