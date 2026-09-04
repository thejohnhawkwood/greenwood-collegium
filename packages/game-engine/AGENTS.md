# @greenwood/game-engine

Pure game rules. No React, Fastify, Socket.IO, PostgreSQL, Drizzle, or browser APIs.

- Ticket 003 owns `look`. It returns a `room.snapshot` event.
- Callers supply world state, a look intent, and an injectable clock / id source.
- Do not persist or emit sockets here.
- Accept an injectable random source when combat exists.
