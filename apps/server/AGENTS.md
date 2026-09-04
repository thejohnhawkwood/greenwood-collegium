# @greenwood/server

Fastify process for HTTP and Socket.IO.

- Socket handlers coordinate. They call the engine. They do not invent room text.
- Ignore client-supplied account, role, or character fields. Ticket 007 assigns one unused in-memory character per socket.
- Validate command payloads with Zod before calling `handleLook`, `handleMove`, or `handleSay`.
- Persist critical mutations before acknowledging success (Ticket 008+).
- Account and character records use repository interfaces. In-memory tests always run. Postgres tests run only with `GREENWOOD_TEST_DATABASE_URL`.
- Never log `DATABASE_URL` or read a production dump.
