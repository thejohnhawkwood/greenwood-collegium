import { describe, expect, it } from "vitest";
import { formatQuestUpdatedText, questUpdatedEventSchema } from "./quest-updated.js";

describe("quest.updated contract", () => {
  it("renders start, progress, and completion from the same payload shape", () => {
    const started = questUpdatedEventSchema.parse({
      eventId: "evt-quest-1",
      sequence: 2,
      schemaVersion: 0,
      type: "quest.updated",
      occurredAt: "2026-09-07T21:00:00.000Z",
      audience: "character",
      narration: "Quest started: Arrival at the Collegium.",
      payload: {
        characterId: "char-rowan",
        questId: "arrival-at-the-collegium",
        title: "Arrival at the Collegium",
        status: "active",
        completedObjectives: [],
        remainingObjectives: ["Look around Lantern Court"],
      },
    });
    expect(formatQuestUpdatedText(started.payload)).toBe(started.narration);
    expect(
      formatQuestUpdatedText({
        ...started.payload,
        completedObjectives: ["Look around Lantern Court"],
        remainingObjectives: ["Say hello so Porter knows you arrived"],
      }),
    ).toBe("You finished: Look around Lantern Court. Arrival at the Collegium 1/2.");
    expect(
      formatQuestUpdatedText({
        ...started.payload,
        status: "completed",
        completedObjectives: ["Look around Lantern Court"],
        remainingObjectives: [],
      }),
    ).toBe("You completed Arrival at the Collegium.");
  });
});
