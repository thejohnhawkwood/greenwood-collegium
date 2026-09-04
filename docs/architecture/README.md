# Architecture

The Greenwood Collegium is a modular monolith: one repository, one Node.js web service, one PostgreSQL database, and one browser client with clearly separated internal packages.

```text
BROWSER
  React Interface
          |
          | HTTPS + Socket.IO
          |
NODE WEB SERVICE
  Fastify, auth, sockets, commands, application services
          |
PURE GAME ENGINE
  Movement, combat, quests, items, permissions
          |
POSTGRESQL
```

Fixed decisions for version 0.1 are listed in [PRD section 34](../PRD.md#34-decisions-fixed-for-version-01). Accepted records live in [`docs/adr/`](../adr/). Start a session from [`docs/context/CURRENT.md`](../context/CURRENT.md).
