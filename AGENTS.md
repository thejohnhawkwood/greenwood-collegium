# Agent instructions

The Greenwood Collegium is a classroom MUD and a public proof of work. Agents assist with issue-sized work. They are not the product architect of record and must not build the entire game in one pass.

Read `docs/PRD.md` and any relevant ADRs before editing. For player-facing story, read `docs/content/STORY.md` (spine) and `docs/content/quests/` (storylines). For Primer leaves, read `docs/content/PROGRESSION.md`. For illustrations, read `GREENWOOD_ART_DIRECTION.md` and ADR-0041.

## Required rules

1. TypeScript strict mode is required.
2. The server is authoritative.
3. React components never contain game rules.
4. Socket handlers coordinate; they do not calculate domain outcomes.
5. The game engine has no Web, database, or framework dependency.
6. All external input is validated.
7. All significant game events include plain text.
8. Preserve complete plain-text narration and typed commands. A separate classic UI is not required (owner decision, September 10, 2026; ADR-0028).
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

## Art

New and revised pictures follow `GREENWOOD_ART_DIRECTION.md` (22 September 2026). The operating manual is `GREENWOOD_ART_ASSET_AGENT.md`. One task at a time lives in `docs/art/START_HERE.md`. ADR-0041 records the decision. ADR-0032 still owns painted-catalog paths and the compositor.

Philip Bird locked the comic-ink pass on 22 September 2026. Masters: `art/sources/character_mouse-female-fern_look__v007__comic-ink.png`, `art/sources/character_hare-female-fern_look__v005__comic-ink.png`, and `art/sources/room_lantern-court__v003__comic-ink.png`. Heavy black contour, flat local colour behind it. Slices are in `docs/art/SLICES.md`. Do not copy those figures onto a different character, and do not copy comic or book characters. A smooth painting with no heavy ink fails the direction.

Do not treat emoji, stock creatures, smooth vector mascots, CSS silhouettes, or a paper-texture filter over a smooth painting as finished art. Keep the school setting adventurous and welcoming, without gore, sexualized characters, or decorative religious or occult symbols.

This direction does not authorize a gameplay rewrite, a new UI, a new equipment system, a map-geometry change, or a batch replacement of `apps/web/public/art/`. Default to an audit. Generate, owner approval, and integration are separate permissions. Philip Bird approves a specific revision. Do not claim an image was generated or inspected unless that work happened. Do not send secrets or student data to an image provider.

The Cursor specialist is `.cursor/agents/greenwood-art.md`. The explicit skill is `greenwood-art-workflow`. Model notes are in `docs/art/CURSOR_IMAGE_MODEL_GUIDE.md`; recheck official documentation before a provider call. That guide does not select the image backend by itself.

## Security

- `.env` and credentials stay out of agent context.
- Production deployment remains human-controlled.
- Do not request or accept a production database dump.
- Do not merge your own pull request.
- Do not commit student data, real chat, or secrets.
