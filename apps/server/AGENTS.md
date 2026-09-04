# @greenwood/server

Fastify process for HTTP and, later, Socket.IO.

- Ticket 001: health and version routes only.
- Ticket 004: command round trip. Socket handlers coordinate; they do not calculate domain outcomes.
- Authenticate from server session context when auth exists. Ignore client-supplied identity fields.
- Persist critical mutations before acknowledging success (Ticket 008+).
