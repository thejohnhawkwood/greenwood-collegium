# 2026-09-03 — Ticket 004 Socket.IO look

## Intent

Deliver `look` from a client to the engine and back as a validated `room.snapshot`.

## Machine

Home desktop, branch `ticket-004-socket-look`.

## What changed

- Command request and ack contracts
- Socket.IO gateway on Fastify
- Temporary Rowan identity in an in-memory Lantern Court
- Browser look button; Vite proxies `/socket.io`
- Built web files are served from Fastify when `apps/web/dist` exists

## PRD / ADR

- PRD Appendix E Ticket 004, section 16.1–16.2
- ADR-0010

## Classroom note

A typed `look` now crosses the network. The server still decides the room text.

## Next

Ticket 005: classic transcript and a real command input.

## Open questions

Temporary shared character must go away in Ticket 009.
