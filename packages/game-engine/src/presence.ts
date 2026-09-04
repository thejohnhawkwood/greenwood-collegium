import type { RoomSnapshotEvent } from "@greenwood/contracts";
import { handleLook } from "./look.js";
import { charactersInRoom } from "./occupants.js";
import { enteredNotices, leftNotices, type OccupantNotice } from "./presence-events.js";
import type { EngineRuntime, JoinIntent, LeaveIntent, WorldState } from "./state.js";

export type JoinSuccess = {
  ok: true;
  events: RoomSnapshotEvent[];
  notices: OccupantNotice[];
};

export type LeaveSuccess = {
  ok: true;
  events: [];
  notices: OccupantNotice[];
};

export type PresenceFailure = {
  ok: false;
  code: "character_exists" | "character_not_found" | "room_not_found";
  message: string;
};

export type JoinResult = JoinSuccess | PresenceFailure;
export type LeaveResult = LeaveSuccess | PresenceFailure;

export function handleJoin(
  world: WorldState,
  intent: JoinIntent,
  runtime: EngineRuntime,
): JoinResult {
  if (world.characters[intent.characterId]) {
    return {
      ok: false,
      code: "character_exists",
      message: `Character "${intent.characterId}" is already present.`,
    };
  }

  const room = world.rooms[intent.roomId];
  if (!room) {
    return {
      ok: false,
      code: "room_not_found",
      message: `The room "${intent.roomId}" is missing.`,
    };
  }

  const watchers = charactersInRoom(world, room.id);
  world.characters[intent.characterId] = {
    id: intent.characterId,
    name: intent.name,
    roomId: room.id,
    discoveredRoomIds: [room.id],
  };
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }

  const look = handleLook(world, { verb: "look", characterId: character.id }, runtime);
  if (!look.ok) {
    delete world.characters[intent.characterId];
    return { ok: false, code: look.code, message: look.message };
  }

  return {
    ok: true,
    events: [look.event],
    notices: enteredNotices(watchers, character, room.id, runtime),
  };
}

export function handleLeave(
  world: WorldState,
  intent: LeaveIntent,
  runtime: EngineRuntime,
): LeaveResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }

  const roomId = character.roomId;
  const watchers = charactersInRoom(world, roomId, character.id);
  const notices = leftNotices(watchers, character, roomId, runtime);
  delete world.characters[character.id];
  return { ok: true, events: [], notices };
}
