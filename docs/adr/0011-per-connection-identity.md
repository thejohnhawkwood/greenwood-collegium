# ADR-0011: One temporary character per socket

## Status

Accepted

## Context

Ticket 007 needs two browser sessions to see one another. ADR-0010 bound every connection to the same Rowan. Auth is still Ticket 009.

## Decision

- The server assigns an unused in-memory woodland character to each socket.
- The client still cannot choose account, role, or character.
- Disconnect removes that character and notifies remaining occupants.
- Ticket 009 replaces this pool with authenticated characters in production. Development and tests keep the pool.

## Consequences

Two tabs can stand in Lantern Court together. A fifth simultaneous guest is refused until accounts exist.
