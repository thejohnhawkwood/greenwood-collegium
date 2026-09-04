import {
  formatRoomSnapshotText,
  renderClassicSegments,
  roomSnapshotEventSchema,
  schemaVersion,
  type RoomSnapshotEvent,
  type RoomSnapshotPayload,
  type SemanticSegment,
} from "@greenwood/contracts";
import type { Character, EngineRuntime, LookIntent, Room, WorldState } from "./state.js";

export type LookSuccess = {
  ok: true;
  event: RoomSnapshotEvent;
};

export type LookFailure = {
  ok: false;
  code: "character_not_found" | "room_not_found";
  message: string;
};

export type LookResult = LookSuccess | LookFailure;

export function handleLook(
  world: WorldState,
  intent: LookIntent,
  runtime: EngineRuntime,
): LookResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }

  const room = world.rooms[character.roomId];
  if (!room) {
    return {
      ok: false,
      code: "room_not_found",
      message: `The room "${character.roomId}" is missing.`,
    };
  }

  const payload = snapshotPayload(room, world, character);
  const narration = formatRoomSnapshotText(payload);
  const segments = snapshotSegments(payload);

  if (renderClassicSegments(segments) !== narration) {
    throw new Error("classic segments drifted from room snapshot narration");
  }

  const event = roomSnapshotEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(character.id),
    schemaVersion,
    type: "room.snapshot",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    roomId: room.id,
    narration,
    segments,
    payload,
  } satisfies RoomSnapshotEvent);

  return { ok: true, event };
}

function snapshotPayload(room: Room, world: WorldState, looker: Character): RoomSnapshotPayload {
  const otherPlayers = Object.values(world.characters)
    .filter((character) => character.roomId === room.id && character.id !== looker.id)
    .map((character) => ({
      id: character.id,
      name: character.name,
      kind: "player" as const,
    }));

  return {
    roomId: room.id,
    title: room.title,
    shortDescription: room.shortDescription,
    longDescription: room.longDescription,
    zone: room.zone,
    exits: room.exits.map((exit) => ({ direction: exit.direction, toRoomId: exit.toRoomId })),
    visible: [
      ...room.fixtures.map((fixture) => ({
        id: fixture.id,
        name: fixture.name,
        kind: fixture.kind,
      })),
      ...otherPlayers,
    ],
  };
}

function snapshotSegments(payload: RoomSnapshotPayload): SemanticSegment[] {
  const segments: SemanticSegment[] = [
    { kind: "location", id: payload.roomId, text: payload.title },
    { kind: "text", text: `\n\n${payload.longDescription}` },
  ];

  if (payload.visible.length > 0) {
    segments.push({ kind: "text", text: "\n\nYou see:" });
    for (const entity of payload.visible) {
      segments.push({ kind: "text", text: "\n  " });
      segments.push({
        kind: entity.kind === "object" ? "item" : "actor",
        id: entity.id,
        text: entity.name,
      });
    }
  }

  if (payload.exits.length > 0) {
    const directions = payload.exits.map((exit) => exit.direction).join(", ");
    segments.push({ kind: "text", text: `\n\nExits: ${directions}` });
  }

  return segments;
}
