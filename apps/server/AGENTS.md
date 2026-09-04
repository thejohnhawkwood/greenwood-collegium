# @greenwood/server

Fastify process for HTTP and Socket.IO.

- Socket handlers coordinate. They call the engine. They do not invent room text.
- Ignore client-supplied account, role, or character fields. Production sockets require a session cookie. Development and tests may still assign an unused in-memory guest.
- Validate command payloads with Zod before calling `handleLook`, `handleMove`, or `handleSay`.
- Persist critical mutations before acknowledging success (Ticket 008+).
- Repeat command IDs must return the first result. Authenticated disconnects get a resume grace and `session.snapshot`.
- Account and character records use repository interfaces. In-memory tests always run. Postgres tests run only with `GREENWOOD_TEST_DATABASE_URL`.
- Never log `DATABASE_URL`, passwords, session tokens, invite tokens, or read a production dump.
