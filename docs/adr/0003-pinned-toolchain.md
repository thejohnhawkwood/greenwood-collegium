# ADR-0003: Pinned TypeScript toolchain

## Status

Accepted

## Context

Desktop and a work laptop must produce the same install and the same CI result. The PRD pins Node 24 LTS, pnpm workspaces, strict TypeScript, React 19, Vite 8, Fastify 5, Zod 4, Vitest, ESLint, and Prettier.

## Decision

- Pin Node 24 with `.nvmrc`, `.node-version`, and `package.json` `engines`.
- Pin pnpm with Corepack and the `packageManager` field.
- Commit `pnpm-lock.yaml`. Installs use `--frozen-lockfile` in CI and on Render.
- Use TypeScript in strict mode across apps and packages.
- Ticket 001 runtime libraries: React 19, Vite 8, Fastify 5, Pino, Zod 4, Vitest, ESLint, Prettier.
- Do not add Socket.IO, Drizzle, Playwright, Argon2, or `pg` until their ticket states a one-sentence rationale.

## Consequences

A new machine that follows `docs/dev/machine-setup.md` should pass `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm build` without editing lockfiles. Major upgrades require a dedicated issue.
