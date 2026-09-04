import {
  formatMapDiscoveredText,
  mapDiscoveredEventSchema,
  renderClassicSegments,
  schemaVersion,
  type MapDiscoveredEvent,
  type RoomSnapshotEvent,
} from "@greenwood/contracts";
import { handleLook } from "./look.js";
import { charactersInRoom } from "./occupants.js";
import {
  arrivalDirection,
  enteredNotices,
  leftNotices,
  type OccupantNotice,
} from "./presence-events.js";
import type { EngineRuntime, MoveIntent, Room, WorldState } from "./state.js";

export type MoveSuccess = {
  ok: true;
  events: Array<MapDiscoveredEvent | RoomSnapshotEvent>;
  notices: OccupantNotice[];
};

export type MoveFailure = {
  ok: false;
  code: "character_not_found" | "room_not_found" | "no_exit" | "exit_closed";
  message: string;
};

export type MoveResult = MoveSuccess | MoveFailure;

export function handleMove(
  world: WorldState,
  intent: MoveIntent,
  runtime: EngineRuntime,
): MoveResult {
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

  const exit = room.exits.find((candidate) => candidate.direction === intent.direction);
  if (!exit) {
    return {
      ok: false,
      code: "no_exit",
      message: missingExitMessage(room, intent.direction),
    };
  }

  const destination = world.rooms[exit.toRoomId];
  if (!destination) {
    return {
      ok: false,
      code: "exit_closed",
      message: `The way ${intent.direction} is not open yet.`,
    };
  }

  const leavers = charactersInRoom(world, room.id, character.id);
  character.roomId = destination.id;
  const arrivals = charactersInRoom(world, destination.id, character.id);

  const events: Array<MapDiscoveredEvent | RoomSnapshotEvent> = [];
  if (!character.discoveredRoomIds.includes(destination.id)) {
    character.discoveredRoomIds.push(destination.id);
    events.push(discoveryEvent(destination, runtime, character.id));
  }

  const look = handleLook(world, { verb: "look", characterId: character.id }, runtime);
  if (!look.ok) {
    return look;
  }
  events.push(look.event);

  return {
    ok: true,
    events,
    notices: [
      ...leftNotices(leavers, character, room.id, runtime, intent.direction),
      ...enteredNotices(
        arrivals,
        character,
        destination.id,
        runtime,
        arrivalDirection(intent.direction),
      ),
    ],
  };
}

function missingExitMessage(room: Room, direction: string): string {
  const exits = room.exits.map((exit) => exit.direction);
  if (exits.length === 0) {
    return `There is no way ${direction}.`;
  }
  return `There is no way ${direction}.\n\nExits: ${exits.join(", ")}`;
}

function discoveryEvent(
  room: Room,
  runtime: EngineRuntime,
  characterId: string,
): MapDiscoveredEvent {
  const payload = {
    roomId: room.id,
    title: room.title,
    method: "movement" as const,
    exits: room.exits.map((exit) => ({ direction: exit.direction, toRoomId: exit.toRoomId })),
  };
  const narration = formatMapDiscoveredText(payload);
  const segments = [
    { kind: "system" as const, text: "You have discovered " },
    { kind: "location" as const, id: room.id, text: room.title },
    { kind: "text" as const, text: "." },
  ];

  if (renderClassicSegments(segments) !== narration) {
    throw new Error("classic segments drifted from map.discovered narration");
  }

  return mapDiscoveredEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(characterId),
    schemaVersion,
    type: "map.discovered",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    roomId: room.id,
    narration,
    segments,
    payload,
  } satisfies MapDiscoveredEvent);
}
