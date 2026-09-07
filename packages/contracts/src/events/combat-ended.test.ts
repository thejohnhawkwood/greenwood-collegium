import { describe, expect, it } from "vitest";
import { combatEndedEventSchema, formatCombatEndedText } from "./combat-ended.js";

describe("combat.ended contract", () => {
  it("renders victory and non-graphic defeat from the same schema", () => {
    const victory = combatEndedEventSchema.parse({
      eventId: "evt-combat-end-1",
      sequence: 5,
      schemaVersion: 0,
      type: "combat.ended",
      occurredAt: "2026-09-07T19:00:00.000Z",
      audience: "character",
      roomId: "south-orchard",
      encounterId: "enc-1",
      narration: "The Practice Dummy topples. The lesson is over.",
      payload: {
        encounterId: "enc-1",
        characterId: "char-rowan",
        roomId: "south-orchard",
        enemyName: "Practice Dummy",
        outcome: "victory",
      },
    });
    const defeat = combatEndedEventSchema.parse({
      eventId: "evt-combat-end-2",
      sequence: 6,
      schemaVersion: 0,
      type: "combat.ended",
      occurredAt: "2026-09-07T19:00:00.000Z",
      audience: "character",
      roomId: "infirmary",
      encounterId: "enc-1",
      narration: "The lesson ends. You wake in the Infirmary, unhurt.",
      payload: {
        encounterId: "enc-1",
        characterId: "char-rowan",
        roomId: "infirmary",
        enemyName: "Practice Dummy",
        outcome: "defeat",
      },
    });

    expect(formatCombatEndedText(victory.payload)).toBe(victory.narration);
    expect(formatCombatEndedText(defeat.payload)).toBe(defeat.narration);
  });
});
