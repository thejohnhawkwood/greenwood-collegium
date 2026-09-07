import { describe, expect, it } from "vitest";
import {
  combatStatusAppliedEventSchema,
  formatCombatStatusAppliedText,
} from "./combat-status-applied.js";

describe("combat.status_applied contract", () => {
  it("renders apply, tick, and end in plain text", () => {
    const applied = combatStatusAppliedEventSchema.parse({
      eventId: "evt-burn-1",
      sequence: 4,
      schemaVersion: 0,
      type: "combat.status_applied",
      occurredAt: "2026-09-07T20:00:00.000Z",
      audience: "character",
      encounterId: "enc-1",
      narration: "The Practice Dummy is burning (2 rounds).",
      payload: {
        encounterId: "enc-1",
        targetId: "enemy-practice-dummy-south-orchard",
        targetName: "Practice Dummy",
        statusId: "burning",
        remainingRounds: 2,
        phase: "applied",
      },
    });
    const tick = combatStatusAppliedEventSchema.parse({
      eventId: "evt-burn-2",
      sequence: 8,
      schemaVersion: 0,
      type: "combat.status_applied",
      occurredAt: "2026-09-07T20:00:00.000Z",
      audience: "character",
      encounterId: "enc-1",
      narration: "The Practice Dummy smoulders for 1. It has 2 remaining. Burning: 1 round.",
      payload: {
        encounterId: "enc-1",
        targetId: "enemy-practice-dummy-south-orchard",
        targetName: "Practice Dummy",
        statusId: "burning",
        remainingRounds: 1,
        phase: "tick",
        tickDamage: 1,
        targetHealth: 2,
        targetMaxHealth: 8,
      },
    });
    const ended = combatStatusAppliedEventSchema.parse({
      eventId: "evt-burn-3",
      sequence: 12,
      schemaVersion: 0,
      type: "combat.status_applied",
      occurredAt: "2026-09-07T20:00:00.000Z",
      audience: "character",
      encounterId: "enc-1",
      narration: "The fire on the Practice Dummy goes out.",
      payload: {
        encounterId: "enc-1",
        targetId: "enemy-practice-dummy-south-orchard",
        targetName: "Practice Dummy",
        statusId: "burning",
        remainingRounds: 0,
        phase: "ended",
      },
    });

    expect(formatCombatStatusAppliedText(applied.payload)).toBe(applied.narration);
    expect(formatCombatStatusAppliedText(tick.payload)).toBe(tick.narration);
    expect(formatCombatStatusAppliedText(ended.payload)).toBe(ended.narration);
  });
});
