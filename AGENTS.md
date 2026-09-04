# Agent instructions

The Greenwood Collegium is a classroom MUD and a public proof of work. Agents assist with issue-sized work. They are not the product architect of record and must not build the entire game in one pass.

Read `docs/PRD.md` and any relevant ADRs before editing.

## Required rules

1. TypeScript strict mode is required.
2. The server is authoritative.
3. React components never contain game rules.
4. Socket handlers coordinate; they do not calculate domain outcomes.
5. The game engine has no Web, database, or framework dependency.
6. All external input is validated.
7. All significant game events include plain text.
8. Classic interface compatibility may not be removed.
9. No new dependency without rationale.
10. No schema change without a migration.
11. No secret or production data may be read, logged, or committed.
12. Every behaviour change requires tests.
13. World content remains declarative.
14. Accessibility is part of acceptance, not a later patch.
15. Do not modify unrelated files.
16. Do not silently weaken types to make tests pass.
17. Never use `any` as a shortcut without documented justification.
18. Update documentation when behaviour changes.

## Workflow for non-trivial tickets

1. Read the PRD and relevant ADRs.
2. Read relevant package `AGENTS.md` files when they exist.
3. Inspect current code.
4. Restate the requirement.
5. Identify files expected to change, tests, and risks.
6. Propose a plan before editing.
7. Implement the smallest complete slice.
8. Run typecheck, lint, and tests when those commands exist.
9. Summarize the diff and disclose unresolved concerns.
10. Include AI disclosure in the pull request.

## Security

- `.env` and credentials stay out of agent context.
- Production deployment remains human-controlled.
- Do not request or accept a production database dump.
- Do not merge your own pull request.
- Do not commit student data, real chat, or secrets.
