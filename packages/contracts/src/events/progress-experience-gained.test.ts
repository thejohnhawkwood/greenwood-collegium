import { describe, expect, it } from "vitest";
import {
  experienceGainedEventSchema,
  formatExperienceGainedText,
} from "./progress-experience-gained.js";

describe("progress.experience_gained contract", () => {
  it("states the awarded amount in plain text", () => {
    const event = experienceGainedEventSchema.parse({
      eventId: "evt-xp-1",
      sequence: 6,
      schemaVersion: 0,
      type: "progress.experience_gained",
      occurredAt: "2026-09-07T19:00:00.000Z",
      audience: "character",
      narration: "You gain 5 experience.",
      payload: {
        characterId: "char-rowan",
        amount: 5,
        total: 5,
      },
    });

    expect(formatExperienceGainedText(event.payload)).toBe(event.narration);
  });
});
