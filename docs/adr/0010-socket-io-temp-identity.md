# ADR-0010: Socket.IO round trip and temporary identity

## Status

Accepted

## Context

Ticket 004 must deliver `look` from a browser to the engine and back. Auth does not exist until Ticket 009. The client must not choose its own character.

## Decision

- Attach Socket.IO 4.x to the existing Fastify HTTP server.
- Clients emit `command` and receive `event`. Acknowledgements use the Socket.IO ack callback.
- Socket handlers validate the command, call `handleLook`, and emit the engine event. They do not invent room text.
- Until Ticket 009, every connection is bound to a server-chosen temporary character in an in-memory Lantern Court. Client-supplied identity fields are ignored.
- CORS origins come from `ALLOWED_ORIGINS`, plus Render's `RENDER_EXTERNAL_URL` when present.

## Consequences

The live process can prove the command cycle before accounts exist. Ticket 007 replaces the shared temporary character with one character per socket. Ticket 009 replaces that pool with authenticated characters. Ticket 005 owns the classic transcript chrome.
