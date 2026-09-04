# ADR-0002: Server-authoritative events; Socket.IO later

## Status

Accepted

## Context

The browser can request an action. Only the server may decide whether it succeeds. PRD section 16 requires structured events plus plain-text narration so classic, colour, HUD, and test renderers share one meaning.

Socket.IO is the required transport, but Ticket 001 has no gameplay and no command round trip.

## Decision

- The server is the only authority for game state.
- React components and future socket handlers must not calculate damage, rewards, movement, or permissions.
- Realtime transport is Socket.IO 4.x, introduced in Ticket 004.
- Ticket 001 exposed HTTP health and version only. Ticket 004 adds Socket.IO.

## Consequences

Ticket 002 can define event contracts without a live socket. Ticket 003 can test `look` with no network. Ticket 004 wires Fastify + Socket.IO to those contracts. Classic clients will always have plain-text fallbacks.
