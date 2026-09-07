# @greenwood/content

Declarative world data. No React, Fastify, Socket.IO, PostgreSQL, Drizzle, or game rules.

- Ticket 011 owns room JSON, JSON Schema, and validation.
- Ticket 012 owns item templates and placements.
- Ticket 013 owns enemy templates and placements.
- Ticket 014 owns spell templates. Ember is the first spell.
- Add a room by adding `rooms/<id>.json`. The file name must match the stable id.
- Add an item by adding `items/<id>.json` and a placement in `placements/`.
- Add an enemy by adding `enemies/<id>.json` and a placement in `enemy-placements/`.
- Add a spell by adding `spells/<id>.json`.
- Do not edit TypeScript to register a room, item, enemy, or spell.
- Invalid content fails `pnpm --filter @greenwood/content validate` and process start.
- Students start in `lantern-court`.
