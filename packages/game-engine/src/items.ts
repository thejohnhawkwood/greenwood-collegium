import type { ItemInstance, WorldState } from "./state.js";

export function worldItems(world: WorldState): Record<string, ItemInstance> {
  if (!world.items) {
    world.items = {};
  }
  return world.items;
}

export function itemsInRoom(world: WorldState, roomId: string): ItemInstance[] {
  return Object.values(worldItems(world)).filter((item) => item.roomId === roomId);
}

export function itemsHeldBy(world: WorldState, characterId: string): ItemInstance[] {
  return Object.values(worldItems(world)).filter((item) => item.holderCharacterId === characterId);
}

export function matchItems(candidates: readonly ItemInstance[], target: string): ItemInstance[] {
  const needle = target.trim().toLowerCase();
  if (needle.length === 0) {
    return [];
  }
  return candidates.filter((item) => {
    const name = item.name.toLowerCase();
    return (
      item.id === needle || item.templateId === needle || name === needle || name.includes(needle)
    );
  });
}
