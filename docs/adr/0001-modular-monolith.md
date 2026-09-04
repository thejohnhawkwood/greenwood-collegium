# ADR-0001: Modular monolith, one origin, one instance

## Status

Accepted

## Context

The Greenwood Collegium must stay explainable in a Grade 9–12 classroom. A microservice mesh would hide the command path and multiply deployables before the first `look` works.

PRD sections 13 and 34 already fix the shape: one repository, one Node web service, one PostgreSQL database, one browser client, and one production instance.

## Decision

Ship a modular monolith:

- one Git repository;
- one Render Web Service that serves HTTP and, later, Socket.IO;
- one Render Postgres 18 instance;
- one browser client built by Vite and, in production, served from the same origin as the API;
- internal packages (`apps/*`, `packages/*`) with clear public boundaries.

Do not add a second deployable API, a separate realtime host, or a second application instance until a later ADR covers shared adapters and cross-instance coordination.

## Consequences

Classroom tracing stays linear: browser → one Node process → engine → database. Scaling beyond one instance is explicitly out of version 0.1. Preview environments on Render are not required for Ticket 001.
