import { schemaVersion } from "../schema-version.js";
import type { RoomSnapshotEvent } from "../events/room-snapshot.js";
import { formatRoomSnapshotText } from "../events/room-snapshot.js";

const payload = {
  roomId: "lantern-court",
  title: "Lantern Court",
  shortDescription: "A circular courtyard under drifting blue lanterns.",
  longDescription:
    "Ancient oak branches arch over a circular courtyard.\nBlue lanterns drift between the leaves.",
  zone: "academy-core",
  exits: [
    { direction: "north", toRoomId: "great-hall" },
    { direction: "east", toRoomId: "east-gate" },
    { direction: "west", toRoomId: "west-cloister" },
  ],
  visible: [
    { id: "npc-porter-bramble", name: "Porter Bramble", kind: "npc" as const },
    { id: "char-rowan", name: "Rowan the Hare", kind: "player" as const },
  ],
};

const narration = formatRoomSnapshotText(payload);

export const lanternCourtSnapshotFixture: RoomSnapshotEvent = {
  eventId: "evt-room-snapshot-lantern-court",
  sequence: 1,
  schemaVersion,
  type: "room.snapshot",
  occurredAt: "2026-09-03T21:00:00.000Z",
  audience: "character",
  roomId: "lantern-court",
  narration,
  payload,
  segments: [
    { kind: "location", id: "lantern-court", text: "Lantern Court" },
    { kind: "text", text: "\n\n" },
    {
      kind: "text",
      text: "Ancient oak branches arch over a circular courtyard.\nBlue lanterns drift between the leaves.",
    },
    { kind: "text", text: "\n\nYou see:\n  " },
    { kind: "actor", id: "npc-porter-bramble", text: "Porter Bramble" },
    { kind: "text", text: "\n  " },
    { kind: "actor", id: "char-rowan", text: "Rowan the Hare" },
    { kind: "text", text: "\n\nExits: north, east, west" },
  ],
};
