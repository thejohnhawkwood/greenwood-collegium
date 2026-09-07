# ADR-0025: Classroom load logs and simulation

## Status

Accepted

## Context

Ticket 018 must prove 30 Collegians can share the courtyard and leave a trail if the process crashes during class. Chat text is student work. Secrets must stay out of logs.

## Decision

- Process logs record connect, disconnect, command verb, status, duration, and connected count. They do not record `say` text, raw command lines, tickets, cookies, or database URLs.
- The 30-client simulation runs against localhost in CI. It must refuse a Render hostname.
- Tomorrow's class is the live load test. Use Render logs and `/health/ready`, not the simulation pointed at production.

## Consequences

A crash dump can show who was seated and which verbs were slow without storing student speech. Teachers still use `admin audit` for their own announce/inspect/mute/kick/remove rows.
