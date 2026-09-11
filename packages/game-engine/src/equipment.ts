import type { Character, ItemInstance, WorldState } from "./state.js";
import { itemTypeWord } from "./items.js";

export function equippedWeaponType(world: WorldState, character: Character): string | undefined {
  if (!character.equippedItemId) {
    return undefined;
  }
  const item = Object.values(world.items ?? {}).find(
    (candidate) =>
      candidate.id === character.equippedItemId ||
      candidate.templateId === character.equippedItemId,
  );
  if (item) {
    return item.itemType ?? (item.category === "weapon" ? itemTypeWord(item) : undefined);
  }
  const template = world.itemTemplates?.[character.equippedItemId];
  return (
    template?.itemType ?? (template?.category === "weapon" ? itemTypeWord(template) : undefined)
  );
}

export function speciesWeaponFit(
  world: WorldState,
  character: Character,
  item: ItemInstance,
): "fit" | "misfit" | "none" {
  const proficiency = character.speciesId
    ? world.speciesProficiencies?.[character.speciesId]
    : undefined;
  const weaponType = item.itemType ?? (item.category === "weapon" ? itemTypeWord(item) : undefined);
  if (!proficiency || !weaponType || item.category !== "weapon") {
    return "none";
  }
  return proficiency === weaponType ? "fit" : "misfit";
}

export function weaponFeelLine(item: ItemInstance, fit: "fit" | "misfit" | "none"): string {
  const noun = item.itemType ?? itemTypeWord(item);
  if (fit === "fit") {
    return `The ${noun} feels right in your hand.`;
  }
  if (fit === "misfit") {
    return `The ${noun} feels unwieldy.`;
  }
  return `You try the ${item.name}.`;
}

export function setEquippedItem(character: Character, item: ItemInstance): void {
  character.equippedItemId = item.id;
}

export function clearEquippedIfMatching(character: Character, item: ItemInstance): void {
  if (character.equippedItemId === item.id || character.equippedItemId === item.templateId) {
    character.equippedItemId = undefined;
  }
}

export function attackFitModifier(world: WorldState, character: Character): number {
  const proficiency = character.speciesId
    ? world.speciesProficiencies?.[character.speciesId]
    : undefined;
  const weaponType = equippedWeaponType(world, character);
  if (!weaponType) {
    return 0;
  }
  if (proficiency === weaponType) {
    return 1;
  }
  return -1;
}
