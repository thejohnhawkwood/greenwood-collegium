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
- no player-versus-player combat;
- no student records in the repository.

Secrets live in Render environment variables or a local untracked `.env`. Fixtures and screenshots use fictional names.

## Consequences

Open registration, DMs, and PvP require a later ADR and an explicit product decision. Contributors who paste production logs or classmate identity into a pull request will be asked to close it and rotate any exposed secret.
