import { worldItems } from "./items.js";
import type { ItemInstance, StarterItemPlacement, WorldState } from "./state.js";

export function starterInstanceId(placementId: string, characterId: string): string {
  return `${placementId}--${characterId}`;
}

export function availableToCharacterId(
  itemId: string,
  starters: readonly StarterItemPlacement[],
): string | undefined {
  for (const starter of starters) {
    const prefix = `${starter.id}--`;
    if (itemId.startsWith(prefix) && itemId.length > prefix.length) {
      return itemId.slice(prefix.length);
    }
  }
  return undefined;
}

export function characterHasStarterTemplate(
  world: WorldState,
  characterId: string,
  templateId: string,
): boolean {
  return Object.values(worldItems(world)).some((item) => {
    if (item.templateId !== templateId) {
      return false;
    }
    return item.holderCharacterId === characterId || item.availableToCharacterId === characterId;
  });
}

export function ensureCharacterStarterItems(
  world: WorldState,
  characterId: string,
): ItemInstance[] {
  const created: ItemInstance[] = [];
  const items = worldItems(world);
  for (const placement of world.starterPlacements ?? []) {
    if (characterHasStarterTemplate(world, characterId, placement.templateId)) {
      continue;
    }
    const id = starterInstanceId(placement.id, characterId);
    const existing = items[id];
    if (existing) {
      existing.availableToCharacterId = existing.availableToCharacterId ?? characterId;
      continue;
    }
    const instance: ItemInstance = {
      id,
      templateId: placement.templateId,
      name: placement.name,
      examineDescription: placement.examineDescription,
      roomId: placement.roomId,
      availableToCharacterId: characterId,
    };
    items[id] = instance;
    created.push(instance);
  }
  return created;
}
