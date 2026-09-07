import { describe, expect, it } from "vitest";
import { combatStartedEventSchema, formatCombatStartedText } from "./combat-started.js";

describe("combat.started contract", () => {
  it("renders a classroom-safe start line from the payload", () => {
    const event = combatStartedEventSchema.parse({
      eventId: "evt-combat-start-1",
      sequence: 1,
      schemaVersion: 0,
      type: "combat.started",
      occurredAt: "2026-09-07T19:00:00.000Z",
      audience: "character",
      roomId: "south-orchard",
      encounterId: "enc-1",
      narration: "You square up to the Practice Dummy.",
      payload: {
        encounterId: "enc-1",
        roomId: "south-orchard",
        characterId: "char-rowan",
        characterName: "Rowan the Hare",
        enemyId: "enemy-practice-dummy-south-orchard",
        enemyName: "Practice Dummy",
        enemyHealth: 8,
        enemyMaxHealth: 8,
      },
    });

    expect(formatCombatStartedText(event.payload)).toBe(event.narration);
  });
});
