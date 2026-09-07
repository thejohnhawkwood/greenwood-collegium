import { describe, expect, it } from "vitest";
import { formatInventoryUpdatedText, inventoryUpdatedEventSchema } from "./inventory-updated.js";

describe("inventory.updated contract", () => {
  it("lists carried items or an empty bag", () => {
    const empty = inventoryUpdatedEventSchema.parse({
      eventId: "evt-inv-1",
      sequence: 1,
      schemaVersion: 0,
      type: "inventory.updated",
      occurredAt: "2026-09-07T18:00:00.000Z",
      audience: "character",
      narration: "You are not carrying anything.",
      payload: { characterId: "char-rowan", items: [] },
    });
    expect(formatInventoryUpdatedText(empty.payload)).toBe(empty.narration);

    const carried = inventoryUpdatedEventSchema.parse({
      eventId: "evt-inv-2",
      sequence: 2,
      schemaVersion: 0,
      type: "inventory.updated",
      occurredAt: "2026-09-07T18:00:00.000Z",
      audience: "character",
      narration: "You are carrying:\n  Small Copper Key",
      payload: {
        characterId: "char-rowan",
        items: [
          {
            itemId: "item-copper-key-lantern-court",
            templateId: "small-copper-key",
            name: "Small Copper Key",
          },
        ],
      },
    });
    expect(formatInventoryUpdatedText(carried.payload)).toBe(carried.narration);
  });
});
