import { activeEncounter, ensurePlayerVitals } from "./combat-state.js";
import type { Character, WorldState } from "./state.js";

export const VITAL_TICK_AMOUNT = 1;
export const COURTYARD_WELL_ID = "object-courtyard-well";
export const ORCHARD_APPLES_ID = "object-orchard-apples";

export function restoreCharacterVitals(character: Character): boolean {
  ensurePlayerVitals(character);
  const maxHealth = character.maxHealth ?? 0;
  const maxFocus = character.maxFocus ?? 0;
  const alreadyFull = character.health === maxHealth && character.focus === maxFocus;
  character.health = maxHealth;
  character.focus = maxFocus;
  return !alreadyFull;
}

export function tickCharacterVitals(world: WorldState, amount = VITAL_TICK_AMOUNT): string[] {
  const changed: string[] = [];
  for (const character of Object.values(world.characters)) {
    if (activeEncounter(world, character.id)) {
      continue;
    }
    ensurePlayerVitals(character);
    const maxHealth = character.maxHealth ?? 0;
    const maxFocus = character.maxFocus ?? 0;
    const nextHealth = Math.min(maxHealth, (character.health ?? 0) + amount);
    const nextFocus = Math.min(maxFocus, (character.focus ?? 0) + amount);
    if (nextHealth === character.health && nextFocus === character.focus) {
      continue;
    }
    character.health = nextHealth;
    character.focus = nextFocus;
    changed.push(character.id);
  }
  return changed;
}
