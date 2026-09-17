# 2026-09-16 — Lock-in Chorus combat

## Intent
Implement DS-007 scenario D: a twelve-second shot clock, enemy focus, defend,
and flee.

## Machine
Desktop.

## What changed
Solo lock-in combat. First targeted `attack` / `cast` opens the foe card.
Later commands lock and resolve. Expiry auto-defends. Flee stays in the room.
`play-state.encounter` drives CombatStage buttons. ADR-0034 records the pick.

## PRD / ADR
[PRD §12.9](../PRD.md), [ADR-0017](../adr/0017-combat-engine.md),
[ADR-0034](../adr/0034-lock-in-combat.md),
[DS-007](../design-sprints/ds-007-combat-frame.md).

## Classroom note
Students still type the same words. The card is a second way to send them.

## Next
Watch an orchard dummy fight in class. Do not start the queen.

## Open questions
Enemy focus is displayed and not spent. Party lock-in is still later work.
