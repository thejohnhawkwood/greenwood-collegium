# Contributing to The Greenwood Collegium

Thank you for helping build this game and classroom example. This repository is public so that students, colleagues, and reviewers can see how the product grows. Contributions should stay small, reviewable, and safe for a Grade 9–12 classroom.

## Before you start

1. Read [`docs/PRD.md`](docs/PRD.md), especially Goals, Non-Goals, Product Principles, and Appendix D (Definition of Done).
2. Read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
3. Look for an existing issue. If none exists, open one before starting substantial work.
4. Prefer the ticket sequence in [Appendix E](docs/PRD.md#appendix-e-initial-implementation-ticket-sequence) over inventing a new system.

## Ways to contribute

| Kind | Typical work | Notes |
|---|---|---|
| World content | Rooms, items, NPCs, help text | Declarative JSON later; original prose only |
| Documentation | README, ADRs, design sprints, curriculum notes | No student personal data |
| Tests | Unit, contract, integration, Playwright | Every behaviour change needs tests |
| Code | One command, one bug, one module | Keep PRs reviewable |
| Design sprint | Interface upgrade record + issue | Required before major UI work |
| Accessibility | Keyboard, contrast, reduced motion, labels | Part of acceptance, not a later patch |

Student content contributions must never include personal information about classmates.

## Development setup

Follow [`docs/dev/machine-setup.md`](docs/dev/machine-setup.md). The expected local flow is:

```text
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Do not commit generated build output, `.env` files, database dumps, or real credentials. Copy `.env.example` for local names only.

## Branch and pull request process

1. Create a short-lived branch from `main`.
2. Keep the change issue-sized. Do not ask an AI agent to build the entire game in one prompt.
3. Open a pull request using the template.
4. CI must pass before merge once workflows exist.
5. A human maintainer reviews and merges. Agents must not merge their own pull requests.

Pull requests should state:

- the problem;
- the change;
- scope exclusions;
- tests;
- screenshots or transcript where applicable;
- migration impact;
- accessibility impact;
- a student-facing explanation;
- AI assistance used.

### AI disclosure

```text
AI assistance:
- Tool/model:
- Planning assistance:
- Code generation:
- Tests generated:
- Human review performed:
- Known limitations:
```

This is part of the project's transparent development record.

## Architecture rules that will not be bent for convenience

- The server is authoritative. The browser may request an action; only the server decides the outcome.
- React components never contain game rules.
- Socket handlers coordinate; they do not calculate domain outcomes.
- The game engine has no Web, database, or framework dependency.
- All external input is validated.
- Significant game events include structured data and plain-text narration.
- Classic interface compatibility may not be removed.
- No new runtime dependency without a one-sentence rationale.
- No schema change without a migration.
- World content remains declarative.

## Safety and privacy

Do not commit:

- production logs;
- student mappings or legal names;
- real chat exports;
- database backups;
- passwords, tokens, or API keys;
- screenshots that expose student identity.

Use fictional names in fixtures and documentation.

## Reporting issues

Use the issue templates. Security reports belong in a [private advisory](SECURITY.md), not a public bug issue.

## License

By contributing, you agree that your code is licensed under the MIT License, and that original written world content and educational documentation you submit are licensed under CC BY 4.0, unless a maintainer agrees otherwise in writing.
