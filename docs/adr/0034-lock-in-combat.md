# ADR-0034: Lock-in Chorus combat

## Status

Accepted for DS-007, September 16, 2026.

## Context

Combat was a typed lesson: `attack dummy` dealt damage in the same command, and
the room painting had no foe card. DS-007 recorded five turn-taking scenarios.
The owner picked **D (Lock-in Chorus)** with a twelve-second Hearthstone /
Pictionary shot clock, real enemy focus, defend, and flee. Party of three and
the queen stay later work.

## Decision

- The first `attack` or `cast` with a target squares up only. It opens the
  encounter and the foe card. It does not deal damage or spend focus.
- Each later command locks immediately and resolves. Students may act before
  twelve seconds. If the clock expires, the engine chooses defend.
- Defend halves incoming damage with `Math.floor`. Flee always succeeds, keeps
  the Collegian in the room, and ends with `outcome: "fled"`.
- Enemy focus is a real field (Practice Dummy 6, Silk Hatchling 8, default 6).
  Enemies do not spend it yet.
- `play-state.encounter` projects enemy vitals, the lock deadline, and legal
  moves. CombatStage buttons send those commands. Typed commands stay
  canonical.
- The gateway owns `setTimeout`. The engine stays pure with injectable `now()`.

## Consequences

Orchard practice shows a centre card, a twelve-second clock, and Attack /
spell / Defend / Flee. A later party slice can reuse `awaiting_intents`
without changing damage math.
