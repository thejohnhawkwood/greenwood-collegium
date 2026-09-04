import { describe, expect, it } from "vitest";
import { greatHallDiscoveredFixture } from "../fixtures/map-discovered.js";
import { renderClassicNarration } from "./envelope.js";
import { formatMapDiscoveredText, mapDiscoveredEventSchema } from "./map-discovered.js";
import { renderClassicSegments } from "./segments.js";

describe("map.discovered contract", () => {
  it("validates the Great Hall discovery fixture", () => {
    const parsed = mapDiscoveredEventSchema.parse(greatHallDiscoveredFixture);
    expect(parsed.payload.roomId).toBe("great-hall");
    expect(renderClassicNarration(parsed)).toBe(formatMapDiscoveredText(parsed.payload));
    expect(renderClassicSegments(parsed.segments ?? [])).toBe(parsed.narration);
  });
});
