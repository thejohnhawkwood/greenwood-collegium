import { describe, expect, it } from "vitest";
import {
  entityEnteredEventSchema,
  formatEntityEnteredText,
  formatEntityLeftText,
} from "./entity-presence.js";

describe("entity presence contract", () => {
  it("formats arrival and departure lines", () => {
    const entered = entityEnteredEventSchema.parse({
      eventId: "evt-enter-1",
      sequence: 1,
      schemaVersion: 0,
      type: "entity.entered",
      occurredAt: "2026-09-03T21:00:00.000Z",
      audience: "character",
      roomId: "lantern-court",
      narration: "Moss the Mole arrives.",
      payload: {
        characterId: "char-moss",
        name: "Moss the Mole",
        roomId: "lantern-court",
      },
    });

    expect(formatEntityEnteredText(entered.payload)).toBe(entered.narration);
    expect(
      formatEntityLeftText({
        characterId: "char-rowan",
        name: "Rowan the Hare",
        roomId: "lantern-court",
        direction: "north",
      }),
    ).toBe("Rowan the Hare leaves north.");
  });
});
