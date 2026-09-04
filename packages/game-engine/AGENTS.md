# @greenwood/game-engine

Pure game rules. No React, Fastify, Socket.IO, PostgreSQL, Drizzle, or browser APIs.

- Ticket 003 owns `look`. It returns a `room.snapshot` event.
- Ticket 006 owns `handleMove`. It mutates in-memory location and discovery, then emits sequenced events.
- Ticket 007 owns `handleSay`, `handleJoin`, and `handleLeave`. Socket handlers still do not invent room or chat text.
- Callers supply world state, a look or move intent, and an injectable clock / id source.
- Do not persist or emit sockets here.
- Accept an injectable random source when combat exists.
