import type { EventEnvelope } from "@greenwood/contracts";
import type { Character, Encounter, EngineRuntime, WorldState } from "./state.js";

export function encounterMembers(encounter: Encounter): string[] {
  if (encounter.playerIds) {
    return encounter.playerIds;
  }
  return [encounter.playerId];
}

export function isChorus(encounter: Encounter): boolean {
  return encounterMembers(encounter).length > 1;
}

export function presentCollegians(world: WorldState, roomId: string): Character[] {
  return Object.values(world.characters).filter((character) => character.roomId === roomId);
}

export function joinEncounter(character: Character, encounter: Encounter): void {
  const members = encounterMembers(encounter);
  if (members.includes(character.id)) {
    return;
  }
  encounter.playerIds = [...members, character.id];
  character.encounterId = encounter.id;
}

export function dropEncounterMember(
  world: WorldState,
  encounter: Encounter,
  characterId: string,
): void {
  const character = world.characters[characterId];
  if (character?.encounterId === encounter.id) {
    character.encounterId = undefined;
    character.defending = undefined;
    character.nextAttackBonus = undefined;
    character.ignoreNextHit = undefined;
    character.hitThisEncounter = undefined;
  }
  encounter.playerIds = encounterMembers(encounter).filter((id) => id !== characterId);
  if (encounter.playerId === characterId) {
    encounter.playerId = encounter.playerIds[0] ?? characterId;
  }
  if (encounter.locked) {
    delete encounter.locked[characterId];
  }
}

export function partyNotices(
  encounter: Encounter,
  actorId: string,
  events: readonly EventEnvelope[],
  runtime: EngineRuntime,
): { characterId: string; event: EventEnvelope }[] {
  return encounterMembers(encounter)
    .filter((id) => id !== actorId)
    .flatMap((id) =>
      events.map((event) => ({
        characterId: id,
        event: {
          ...event,
          eventId: runtime.nextEventId(),
          sequence: runtime.nextSequence(id),
        },
      })),
    );
}
