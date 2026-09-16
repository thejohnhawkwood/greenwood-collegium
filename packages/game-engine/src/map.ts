import type { EventEnvelope } from "@greenwood/contracts";
import type { EngineRuntime, MapIntent, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export type MapSuccess = {
  ok: true;
  event: EventEnvelope;
};

export type MapFailure = {
  ok: false;
  code: "character_not_found" | "room_not_found";
  message: string;
};

export type MapResult = MapSuccess | MapFailure;

export function handleMap(world: WorldState, intent: MapIntent, runtime: EngineRuntime): MapResult {
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

  const discovered = new Set([...character.discoveredRoomIds, room.id]);
  const charted = Object.values(world.rooms).filter((candidate) => candidate.map);
  const explored = charted
    .filter((candidate) => discovered.has(candidate.id))
    .map((candidate) => candidate.title);
  const fog = charted.length - explored.length;
  const exits = room.exits.map((exit) => exit.direction);
  const fogLine =
    fog === 0
      ? "The charted Collegium is known to you."
      : fog === 1
        ? "1 room remains in fog."
        : `${String(fog)} rooms remain in fog.`;
  const narration = [
    `You are in ${room.title}.`,
    `Explored: ${explored.join(", ")}.`,
    fogLine,
    exits.length ? `Exits from here: ${exits.join(", ")}.` : "There are no visible exits.",
  ].join("\n");
  return { ok: true, event: systemNotice(character.id, narration, runtime) };
}
