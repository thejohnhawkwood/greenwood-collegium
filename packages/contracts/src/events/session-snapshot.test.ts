import { describe, expect, it } from "vitest";
import { schemaVersion } from "../schema-version.js";
import {
  formatSessionSnapshotText,
  sessionSnapshotEventSchema,
  sessionSnapshotPayloadSchema,
} from "./session-snapshot.js";

describe("session.snapshot", () => {
  it("carries resume fields and classic narration", () => {
    const payload = sessionSnapshotPayloadSchema.parse({
      characterId: "char-rowan",
      characterName: "Rowan",
      roomId: "great-hall",
      lastSequence: 4,
    });
    expect(formatSessionSnapshotText(payload, "Great Hall")).toBe("You are still in Great Hall.");
    expect(
      sessionSnapshotEventSchema.parse({
        eventId: "evt-resume-1",
        sequence: 4,
        schemaVersion,
        type: "session.snapshot",
        occurredAt: "2026-09-04T00:00:00.000Z",
        audience: "character",
        roomId: "great-hall",
        narration: formatSessionSnapshotText(payload, "Great Hall"),
        payload,
      }).type,
    ).toBe("session.snapshot");
  });
});
