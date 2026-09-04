# @greenwood/server

Fastify process for HTTP and Socket.IO.

- Socket handlers coordinate. They call the engine. They do not invent room text.
- Ignore client-supplied account, role, or character fields. Ticket 004 uses a temporary server-chosen character.
- Validate command payloads with Zod before calling `handleLook` or `handleMove`.
- Persist critical mutations before acknowledging success (Ticket 008+).
