import {
  formatSessionSnapshotText,
  schemaVersion,
  sessionSnapshotEventSchema,
  type EventEnvelope,
} from "@greenwood/contracts";
import type { EngineRuntime, WorldState } from "@greenwood/game-engine";

export function sessionSnapshotEvent(
  world: WorldState,
  characterId: string,
  runtime: EngineRuntime,
): EventEnvelope {
  const character = world.characters[characterId];
  if (!character) {
    throw new Error(`Character "${characterId}" is not present.`);
  }
  const room = world.rooms[character.roomId];
  if (!room) {
    throw new Error(`The room "${character.roomId}" is missing.`);
  }
  const lastSequence = runtime.nextSequence(characterId);
  const payload = {
    characterId: character.id,
    characterName: character.name,
    roomId: character.roomId,
    lastSequence,
  };
  return sessionSnapshotEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: lastSequence,
    schemaVersion,
    type: "session.snapshot",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    roomId: character.roomId,
    narration: formatSessionSnapshotText(payload, room.title),
    payload,
  });
}
