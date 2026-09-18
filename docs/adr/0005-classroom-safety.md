# ADR-0005: Classroom safety defaults

## Status

Accepted

## Context

The public repository is a proof of work for a Grade 9–12 classroom. Student legal names, chat exports, and production secrets must never enter Git history.

## Decision

Default production and environment-example values:

- `CLASSROOM_MODE=true`
- `PUBLIC_REGISTRATION=false`
- no private messages;
- no surprise player-versus-player combat (consented duels: [ADR-0038](0038-classroom-duels.md));
- no student records in the repository.

Secrets live in Render environment variables or a local untracked `.env`. Fixtures and screenshots use fictional names.

## Consequences

Open registration and DMs still require a later ADR. Consented classroom duels are [ADR-0038](0038-classroom-duels.md). Contributors who paste production logs or classmate identity into a pull request will be asked to close it and rotate any exposed secret.
