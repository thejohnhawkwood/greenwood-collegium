import { describe, expect, it } from "vitest";
import { formatItemDroppedText, itemDroppedEventSchema } from "./item-dropped.js";

describe("item.dropped contract", () => {
  it("renders you-drop and they-drop from the same payload", () => {
    const event = itemDroppedEventSchema.parse({
      eventId: "evt-drop-1",
      sequence: 1,
      schemaVersion: 0,
      type: "item.dropped",
      occurredAt: "2026-09-07T18:00:00.000Z",
      audience: "character",
      roomId: "lantern-court",
      narration: "You drop the Small Copper Key.",
      payload: {
        itemId: "item-copper-key-lantern-court",
        templateId: "small-copper-key",
        name: "Small Copper Key",
        characterId: "char-rowan",
        characterName: "Rowan the Hare",
        roomId: "lantern-court",
      },
    });

    expect(formatItemDroppedText(event.payload, "char-rowan")).toBe(event.narration);
    expect(formatItemDroppedText(event.payload, "char-moss")).toBe(
      "Rowan the Hare drops the Small Copper Key.",
    );
  });
});
