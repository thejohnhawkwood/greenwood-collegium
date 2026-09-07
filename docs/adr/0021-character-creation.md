# ADR-0021: Character creation after sign-in

## Status

Accepted

## Context

Ticket 009 created a character from the classroom username and hard-coded every Collegian as a hare. The PRD requires a chosen display name and species. Live play showed login names in `look`.

## Decision

- The account username is only a login. It is not the character name.
- After sign-in, an incomplete account must finish a Collegian: narrator intro, species, gender, and a given name.
- The server stores the given name, species, and gender. Play text uses `Given the Species`.
- Suggested names come from declarative content. The player may type their own name.
- Existing characters without `creation_completed_at` must finish this step before the courtyard socket opens.
- The client cannot invent account, role, or character authority.

## Consequences

Teachers and students already on the live database see the creation gate once. Production sockets stay closed until the Collegian is complete. Gender is a new persisted field.
