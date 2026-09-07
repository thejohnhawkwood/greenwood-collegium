import { describe, expect, it } from "vitest";
import { formatItemTakenText, itemTakenEventSchema } from "./item-taken.js";

describe("item.taken contract", () => {
  it("renders you-take and they-take from the same payload", () => {
    const event = itemTakenEventSchema.parse({
      eventId: "evt-take-1",
      sequence: 1,
      schemaVersion: 0,
      type: "item.taken",
      occurredAt: "2026-09-07T18:00:00.000Z",
      audience: "character",
      roomId: "lantern-court",
      narration: "You take the Small Copper Key.",
      payload: {
        itemId: "item-copper-key-lantern-court",
        templateId: "small-copper-key",
        name: "Small Copper Key",
        characterId: "char-rowan",
        characterName: "Rowan the Hare",
        roomId: "lantern-court",
      },
    });

    expect(formatItemTakenText(event.payload, "char-rowan")).toBe(event.narration);
    expect(formatItemTakenText(event.payload, "char-moss")).toBe(
      "Rowan the Hare takes the Small Copper Key.",
    );
  });
});
