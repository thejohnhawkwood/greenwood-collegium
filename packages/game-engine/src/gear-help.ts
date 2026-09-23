import type { Character } from "./state.js";

const GUARD_SLOTS = ["helmet", "cloak", "armor", "off-hand"] as const;
const FOCUS_SLOTS = ["necklace", "gloves", "ring-1", "ring-2"] as const;

/** A worn helmet, cloak, armor, or off-hand piece. Extra pieces do not stack. */
export function wearsGuard(character: Character): boolean {
  const gear = character.equipment;
  if (!gear) return false;
  return GUARD_SLOTS.some((slot) => Boolean(gear[slot]));
}

/** A worn necklace, gloves, or ring. Extra pieces do not stack. */
export function wearsFocusHelp(character: Character): boolean {
  const gear = character.equipment;
  if (!gear) return false;
  return FOCUS_SLOTS.some((slot) => Boolean(gear[slot]));
}

/** Focus a cast spends. In a fight, the first cast costs 1 less when focus gear is worn. */
export function castFocusCost(character: Character, cost: number, inFight: boolean): number {
  if (!inFight || character.gearFocusUsed || !wearsFocusHelp(character)) {
    return cost;
  }
  return Math.max(0, cost - 1);
}

export function chargeCastFocus(character: Character, cost: number, inFight: boolean): number {
  const spent = castFocusCost(character, cost, inFight);
  if (inFight && wearsFocusHelp(character) && !character.gearFocusUsed) {
    character.gearFocusUsed = true;
  }
  character.focus = (character.focus ?? 0) - spent;
  return spent;
}

/** The first incoming hit of a fight is 1 lower when guard gear is worn. */
export function applyIncomingGuard(character: Character, damage: number): number {
  if (damage <= 0 || character.gearGuardUsed || !wearsGuard(character)) {
    return damage;
  }
  character.gearGuardUsed = true;
  return Math.max(0, damage - 1);
}

export function wearRewardPhrase(slot?: string): string | undefined {
  switch (slot) {
    case "helmet":
      return "a helmet you can wear";
    case "necklace":
      return "a necklace you can wear";
    case "cloak":
      return "a cloak you can wear";
    case "armor":
      return "armor you can wear";
    case "gloves":
      return "gloves you can wear";
    case "boots":
      return "boots you can wear";
    case "ring":
      return "a ring you can wear";
    case "off-hand":
      return "an off-hand piece you can wear";
    case "main-hand":
      return "a weapon you can hold";
    case "two-hand":
      return "a weapon you can hold in both hands";
    case "ranged":
      return "a ranged weapon you can wear";
    default:
      return undefined;
  }
}
