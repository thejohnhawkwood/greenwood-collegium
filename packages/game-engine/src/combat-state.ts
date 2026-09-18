import { baseMaxFocusForLevel, baseMaxHealthForLevel } from "./progression.js";
import type { Character, Encounter, EngineRuntime, WorldState } from "./state.js";

export const INFIRMARY_ROOM_ID = "infirmary";
export const DEFAULT_PLAYER_MAX_HEALTH = 20;
export const DEFAULT_PLAYER_MAX_FOCUS = 10;
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
  const memberIds = encounter.playerIds ?? [encounter.playerId];
  for (const id of memberIds) {
    const character = world.characters[id];
    if (character?.encounterId === encounter.id) {
      character.encounterId = undefined;
    }
    if (!character) {
      continue;
    }
    if (character.braceBonus) {
      const max = Math.max(
        baseMaxHealthForLevel(character.level ?? 1),
        (character.maxHealth ?? DEFAULT_PLAYER_MAX_HEALTH) - character.braceBonus,
      );
      character.maxHealth = max;
      character.health = Math.min(character.health ?? max, max);
      character.braceBonus = undefined;
    }
    character.nextAttackBonus = undefined;
    character.ignoreNextHit = undefined;
    character.hitThisEncounter = undefined;
    character.defending = undefined;
  }
  delete worldEncounters(world)[encounter.id];
}

export function applyLevelVitals(character: Character, options?: { healGain?: boolean }): void {
  const level = character.level ?? 1;
  const expectedHealth = baseMaxHealthForLevel(level) + (character.braceBonus ?? 0);
  const expectedFocus = baseMaxFocusForLevel(level);
  const previousMaxHealth = character.maxHealth;
  const previousMaxFocus = character.maxFocus;
  if (character.maxHealth === undefined || character.maxHealth < expectedHealth) {
    character.maxHealth = expectedHealth;
  }
  if (character.maxFocus === undefined || character.maxFocus < expectedFocus) {
    character.maxFocus = expectedFocus;
  }
  if (options?.healGain) {
    if (previousMaxHealth !== undefined && character.maxHealth > previousMaxHealth) {
      character.health = Math.min(
        character.maxHealth,
        (character.health ?? previousMaxHealth) + (character.maxHealth - previousMaxHealth),
      );
    }
    if (previousMaxFocus !== undefined && character.maxFocus > previousMaxFocus) {
      character.focus = Math.min(
        character.maxFocus,
        (character.focus ?? previousMaxFocus) + (character.maxFocus - previousMaxFocus),
      );
    }
  }
  character.health ??= character.maxHealth;
  character.focus ??= character.maxFocus;
  character.health = Math.min(character.health, character.maxHealth);
  character.focus = Math.min(character.focus, character.maxFocus);
}

export function ensurePlayerVitals(character: Character): void {
  character.experience ??= 0;
  character.level ??= 1;
  applyLevelVitals(character);
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
    message: "You are in the middle of a lesson. Type attack, cast, defend, or flee.",
  };
}

export function rollAttackDamage(attack: number, roll: number): number {
  return Math.max(1, attack + Math.floor(roll * 3) - 1);
}

export function nextRoll(runtime: EngineRuntime): number {
  return runtime.random?.() ?? 0.5;
}
