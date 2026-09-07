import { describe, expect, it } from "vitest";
import {
  combatTurnStartedEventSchema,
  formatCombatTurnStartedText,
} from "./combat-turn-started.js";

describe("combat.turn_started contract", () => {
  it("names the round in plain text", () => {
    const event = combatTurnStartedEventSchema.parse({
      eventId: "evt-combat-turn-1",
      sequence: 2,
      schemaVersion: 0,
      type: "combat.turn_started",
      occurredAt: "2026-09-07T19:00:00.000Z",
      audience: "character",
      encounterId: "enc-1",
      narration: "Round 1. It is your turn.",
      payload: {
        encounterId: "enc-1",
        round: 1,
        actorId: "char-rowan",
        actorName: "Rowan the Hare",
      },
    });

    expect(formatCombatTurnStartedText(event.payload)).toBe(event.narration);
  });
});
