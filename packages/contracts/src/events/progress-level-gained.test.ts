import { describe, expect, it } from "vitest";
import { formatLevelGainedText, levelGainedEventSchema } from "./progress-level-gained.js";

describe("progress.level_gained contract", () => {
  it("names the new level in plain text", () => {
    const event = levelGainedEventSchema.parse({
      eventId: "evt-level-1",
      sequence: 4,
      schemaVersion: 0,
      type: "progress.level_gained",
      occurredAt: "2026-09-07T21:00:00.000Z",
      audience: "character",
      narration: "You reach Level 2.",
      payload: {
        characterId: "char-rowan",
        level: 2,
        experience: 10,
      },
    });
    expect(formatLevelGainedText(event.payload)).toBe(event.narration);
  });
});
