import type { EventEnvelope } from "@greenwood/contracts";
import {
  DEFAULT_PLAYER_ATTACK,
  DEFAULT_PLAYER_MAX_FOCUS,
  DEFAULT_PLAYER_MAX_HEALTH,
} from "./combat-state.js";
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

export function isDuel(encounter: Encounter): boolean {
  return encounter.kind === "duel";
}

export function duelOpponent(
  world: WorldState,
  encounter: Encounter,
  characterId: string,
): Character | undefined {
  const otherId = encounterMembers(encounter).find((id) => id !== characterId);
  return otherId ? world.characters[otherId] : undefined;
}

export function encounterForViewer(
  world: WorldState,
  encounter: Encounter,
  characterId: string,
): Encounter {
  if (!isDuel(encounter)) {
    return encounter;
  }
  const foe = duelOpponent(world, encounter, characterId);
  if (!foe) {
    return encounter;
  }
  return {
    ...encounter,
    enemy: {
      id: foe.id,
      name: foe.name,
      health: foe.health ?? DEFAULT_PLAYER_MAX_HEALTH,
      maxHealth: foe.maxHealth ?? DEFAULT_PLAYER_MAX_HEALTH,
      focus: foe.focus ?? DEFAULT_PLAYER_MAX_FOCUS,
      maxFocus: foe.maxFocus ?? DEFAULT_PLAYER_MAX_FOCUS,
      attack: DEFAULT_PLAYER_ATTACK,
      experience: 0,
    },
  };
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
    character.gearGuardUsed = undefined;
    character.gearFocusUsed = undefined;
    character.lastStrike = undefined;
    character.nextStrikeBonus = undefined;
    character.strikeLight = undefined;
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
