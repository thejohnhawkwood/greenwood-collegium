# Security Policy

The Greenwood Collegium is a classroom multiplayer game. Reports that protect
students, accounts, and production data are especially welcome.

## Supported versions

This project has not yet published a playable release. Security reports are
accepted for the public repository and for any future deployed environment
operated by the maintainer.

| Version | Supported |
|---|---|
| Repository foundation (`main`) | Yes |
| Unofficial forks or classroom forks | Report to that operator |

## Please report privately

Do **not** open a public GitHub issue for:

- authentication or session bypass;
- privilege escalation or unauthorized admin commands;
- secret or token exposure;
- injection, XSS, or remote code execution;
- access to another player's account or character;
- anything that could expose student identity or school records.

Use one of these channels instead:

1. [GitHub private vulnerability advisory](https://github.com/thejohnhawkwood/greenwood-collegium/security/advisories/new) once the repository is available; or
2. email the maintainer at philipdbird@gmail.com with the subject
   `Greenwood Collegium security`.

Include:

- a short description of the issue;
- affected component or file path if known;
- steps that stay within a system you are authorized to test;
- impact on classroom accounts or student data if relevant;
- whether a secret already leaked.

Do not attach production database dumps, real chat exports, or student lists.

## Maintainer response

The maintainer will acknowledge reports as soon as practical, typically within
seven days, and will say whether the report is accepted, needs more detail, or
is out of scope.

## Project security rules

- Secrets never belong in Git, issues, screenshots, or agent prompts.
- `.env` files are local only. Use `.env.example` for names.
- Classroom mode disables public registration, private messages, and PvP.
- The server enforces permissions. Client UI is not a security boundary.
- All external input is untrusted and must be validated.
- User text is rendered as text, never as HTML.

## Safe classroom testing

Students and contributors may test features on local or maintainer-approved
environments. Do not attempt to break a live school deployment, guess other
people's passwords, or collect classmate data.

Authorized security work should prefer defensive checks, failing tests, and
hardening patches over exploit write-ups.
