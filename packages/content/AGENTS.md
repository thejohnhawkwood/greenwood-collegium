# @greenwood/content

Declarative world data. No React, Fastify, Socket.IO, PostgreSQL, Drizzle, or game rules.

- Ticket 011 owns room JSON, JSON Schema, and validation.
- Ticket 012 owns item templates and placements.
- Add a room by adding `rooms/<id>.json`. The file name must match the stable id.
- Add an item by adding `items/<id>.json` and a placement in `placements/`.
- Do not edit TypeScript to register a room or item.
- Invalid content fails `pnpm --filter @greenwood/content validate` and process start.
- Students start in `lantern-court`.
