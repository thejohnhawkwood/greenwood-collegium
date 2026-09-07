import type { Character, Encounter, EngineRuntime, WorldState } from "./state.js";

export const INFIRMARY_ROOM_ID = "infirmary";
export const DEFAULT_PLAYER_MAX_HEALTH = 20;
export const DEFAULT_PLAYER_ATTACK = 4;

export function worldEncounters(world: WorldState): Record<string, Encounter> {
  if (!world.encounters) {
    world.encounters = {};
  }
  return world.encounters;
}

export function activeEncounter(world: WorldState, characterId: string): Encounter | undefined {
  const character = world.characters[characterId];
  if (!character?.encounterId) {
    return undefined;
  }
  const encounter = world.encounters?.[character.encounterId];
  if (!encounter || encounter.status === "closed") {
    return undefined;
  }
  return encounter;
}

export function encounterUsingSpawn(world: WorldState, spawnId: string): Encounter | undefined {
  return Object.values(world.encounters ?? {}).find(
    (encounter) => encounter.spawnId === spawnId && encounter.status !== "closed",
  );
}

export function closeEncounter(world: WorldState, encounter: Encounter): void {
  const character = world.characters[encounter.playerId];
  if (character?.encounterId === encounter.id) {
    character.encounterId = undefined;
  }
  delete worldEncounters(world)[encounter.id];
}

export function ensurePlayerVitals(character: Character): void {
  character.health ??= DEFAULT_PLAYER_MAX_HEALTH;
  character.maxHealth ??= DEFAULT_PLAYER_MAX_HEALTH;
  character.experience ??= 0;
}

export type InCombatFailure = {
  ok: false;
  code: "in_combat";
  message: string;
};

export function rejectIfInCombat(
  world: WorldState,
  characterId: string,
): InCombatFailure | undefined {
  if (!activeEncounter(world, characterId)) {
    return undefined;
  }
  return {
    ok: false,
    code: "in_combat",
    message: "You are in the middle of a lesson. Type attack to continue.",
  };
}

export function rollAttackDamage(attack: number, roll: number): number {
  return Math.max(1, attack + Math.floor(roll * 3) - 1);
}

export function nextRoll(runtime: EngineRuntime): number {
  return runtime.random?.() ?? 0.5;
}
