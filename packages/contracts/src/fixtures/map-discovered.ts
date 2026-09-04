import { schemaVersion } from "../schema-version.js";
import { formatMapDiscoveredText, type MapDiscoveredEvent } from "../events/map-discovered.js";

const payload = {
  roomId: "great-hall",
  title: "Great Hall",
  method: "movement" as const,
  exits: [{ direction: "south", toRoomId: "lantern-court" }],
};

export const greatHallDiscoveredFixture: MapDiscoveredEvent = {
  eventId: "evt-map-discovered-great-hall",
  sequence: 1,
  schemaVersion,
  type: "map.discovered",
  occurredAt: "2026-09-03T21:00:00.000Z",
  audience: "character",
  roomId: "great-hall",
  narration: formatMapDiscoveredText(payload),
  payload,
  segments: [
    { kind: "system", text: "You have discovered " },
    { kind: "location", id: "great-hall", text: "Great Hall" },
    { kind: "text", text: "." },
  ],
};
