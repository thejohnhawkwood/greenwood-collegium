import {
  eventEnvelopeSchema,
  renderClassicSegments,
  schemaVersion,
  type EventEnvelope,
  type RoomSnapshotEvent,
} from "@greenwood/contracts";
import { closeConversationIfNpcGone } from "./arrival-guide.js";
import { rejectIfInCombat } from "./combat-state.js";
import { beginDefenseAmbushes } from "./combat-resolve.js";
import { handleLook } from "./look.js";
import { namesMatch } from "./names.js";
import { charactersInRoom } from "./occupants.js";
import { enteredNotices, leftNotices, type OccupantNotice } from "./presence-events.js";
import type { EngineRuntime, Room, TravelIntent, WorldState } from "./state.js";

export type TravelSuccess = {
  ok: true;
  events: Array<RoomSnapshotEvent | EventEnvelope>;
  notices: OccupantNotice[];
};

export type TravelFailure = {
  ok: false;
  code:
    | "character_not_found"
    | "room_not_found"
    | "in_combat"
    | "unknown_place"
    | "ambiguous_place"
    | "already_there"
    | "no_known_path";
  message: string;
};

export type TravelResult = TravelSuccess | TravelFailure;

export function handleTravel(
  world: WorldState,
  intent: TravelIntent,
  runtime: EngineRuntime,
): TravelResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }
  const origin = world.rooms[character.roomId];
  if (!origin) {
    return {
      ok: false,
      code: "room_not_found",
      message: `The room "${character.roomId}" is missing.`,
    };
  }
  const blocked = rejectIfInCombat(world, character.id);
  if (blocked) {
    return blocked;
  }
  if (!intent.target.trim()) {
    return {
      ok: false,
      code: "unknown_place",
      message: "Travel where? Name a room you have already visited.",
    };
  }
  const discovered = new Set([...character.discoveredRoomIds, origin.id]);
  const known = Object.values(world.rooms).filter(
    (room) => room.map && discovered.has(room.id) && namesMatch(room.title, room.id, intent.target),
  );
  if (known.length === 0) {
    return {
      ok: false,
      code: "unknown_place",
      message: "You have not found that place yet. Fog still hides names you have not earned.",
    };
  }
  if (known.length > 1) {
    return {
      ok: false,
      code: "ambiguous_place",
      message: `Which place did you mean: ${known.map((room) => room.title).join(", ")}?`,
    };
  }
  const destination = known[0]!;
  if (destination.id === origin.id) {
    return {
      ok: false,
      code: "already_there",
      message: `You are already in ${destination.title}.`,
    };
  }
  if (!discoveredPath(world, origin.id, destination.id, discovered)) {
    return {
      ok: false,
      code: "no_known_path",
      message: `You have not found a way from here to ${destination.title} yet.`,
    };
  }

  const leavers = charactersInRoom(world, origin.id, character.id);
  character.roomId = destination.id;
  closeConversationIfNpcGone(world, character);
  const arrivals = charactersInRoom(world, destination.id, character.id);
  const narration = `You follow the known paths to ${destination.title}.`;
  const segments = [
    { kind: "system" as const, text: "You follow the known paths to " },
    { kind: "location" as const, id: destination.id, text: destination.title },
    { kind: "text" as const, text: "." },
  ];
  if (renderClassicSegments(segments) !== narration) {
    throw new Error("classic segments drifted from travel narration");
  }
  const notice = eventEnvelopeSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(character.id),
    schemaVersion,
    type: "system.notice",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    roomId: destination.id,
    narration,
    segments,
    payload: { roomId: destination.id, title: destination.title, method: "travel" },
  });
  const look = handleLook(world, { verb: "look", characterId: character.id }, runtime);
  if (!look.ok) {
    return { ok: false, code: "room_not_found", message: look.message };
  }
  const ambush = beginDefenseAmbushes(world, runtime).find(
    (opened) => opened.characterId === character.id,
  );
  return {
    ok: true,
    events: ambush ? [notice, look.event, ...ambush.result.events] : [notice, look.event],
    notices: [
      ...leftNotices(leavers, character, origin.id, runtime),
      ...enteredNotices(arrivals, character, destination.id, runtime),
    ],
  };
}

export function discoveredPath(
  world: WorldState,
  fromId: string,
  toId: string,
  discovered: ReadonlySet<string>,
): string[] | undefined {
  if (fromId === toId) return [fromId];
  const queue: string[][] = [[fromId]];
  const seen = new Set([fromId]);
  while (queue.length) {
    const path = queue.shift()!;
    const here = world.rooms[path[path.length - 1]!];
    if (!here) continue;
    for (const exit of here.exits) {
      if (!discovered.has(exit.toRoomId) || seen.has(exit.toRoomId)) continue;
      const next = [...path, exit.toRoomId];
      if (exit.toRoomId === toId) return next;
      seen.add(exit.toRoomId);
      queue.push(next);
    }
  }
  return undefined;
}

export function exploredDestinations(world: WorldState, characterId: string): Room[] {
  const character = world.characters[characterId];
  if (!character) return [];
  const discovered = new Set([...character.discoveredRoomIds, character.roomId]);
  return Object.values(world.rooms).filter((room) => room.map && discovered.has(room.id));
}
