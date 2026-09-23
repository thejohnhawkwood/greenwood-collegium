# ADR-0042: Primer leaf graphs

## Status

Accepted, 22 September 2026. Supersedes only the three-card offer in ADR-0039.
Ranks, the ink cap, and one Field Primer remain.

## Context

ADR-0039 offered three random cards after each lesson, including courtesy
neighbors and a vital-leaf pad. Students asked for a full character choice:
a School is a starting leaf, later Schools can be earned, and veins can rejoin.

## Decision

- The Primer is a full-window book. One School fills both pages as one leaf.
  A School you have not been given is a closed page with the mentor's name and
  no nodes.
- Choosing a School with Alder sets `schoolId` and is the stem of the first
  leaf. That School's intro quest opens the leaf and inks only the signature
  spell at rank I. A later School's intro quest adds that leaf and its
  signature. Home `schoolId` does not change.
- Lessons 4 through 20 grant 1 ink (17). Lessons 4 and 5 wait on the second
  and third hearth lessons. Unspent ink banks. Spend 1 ink to open a legal
  node at rank I or to raise an owned node by one, cap V.
- A node is legal when every AND parent is inked, or any OR parent is inked.
  The client draws the projected graph. It does not decide legality. A click
  sends `ink <name>`. Typed `1` / `2` / `3` no longer spend ink.
- Distance is steps from the stem. An OR rejoin is drawn one step past the
  farther parent. The six graphs are in
  `packages/game-engine/src/leaf-graphs.ts` and copied in
  `packages/content/primer/leaf-graphs.json`.

## Consequences

- Random courtesy cards and vital-leaf filler are gone.
- Old saves that already inked three starters keep those spells. Extra free
  ranks spend against later ink, and unspent ink cannot go below zero.
- No new database column. Unspent ink is derived from awarded levels 4–20
  minus ranks spent beyond each open signature.
