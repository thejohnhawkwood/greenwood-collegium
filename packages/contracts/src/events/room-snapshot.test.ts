import { describe, expect, it } from "vitest";
import { lanternCourtSnapshotFixture } from "../fixtures/room-snapshot.js";
import { renderClassicNarration } from "./envelope.js";
import { formatRoomSnapshotText, roomSnapshotEventSchema } from "./room-snapshot.js";
import { renderClassicSegments } from "./segments.js";

describe("room.snapshot contract", () => {
  it("validates the Lantern Court fixture", () => {
    const parsed = roomSnapshotEventSchema.parse(lanternCourtSnapshotFixture);
    expect(parsed.type).toBe("room.snapshot");
    expect(parsed.payload.roomId).toBe("lantern-court");
  });

  it("renders the fixture to classic plain text", () => {
    const text = renderClassicNarration(lanternCourtSnapshotFixture);
    expect(text).toBe(formatRoomSnapshotText(lanternCourtSnapshotFixture.payload));
    expect(text).toContain("Lantern Court");
    expect(text).toContain("Porter Bramble");
    expect(text).toContain("Exits: north, east, west");
  });

  it("keeps narration equal to concatenated semantic segments", () => {
    const segments = lanternCourtSnapshotFixture.segments;
    expect(segments).toBeDefined();
    expect(renderClassicSegments(segments ?? [])).toBe(lanternCourtSnapshotFixture.narration);
  });

  it("rejects a snapshot missing narration", () => {
    const { narration: _narration, ...invalid } = lanternCourtSnapshotFixture;
    expect(() => {
      roomSnapshotEventSchema.parse(invalid);
    }).toThrow();
  });
});
