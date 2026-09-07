import type { WorldState } from "@greenwood/game-engine";
import type { ItemInstanceRepository, ItemPlacementSeed } from "../persistence/types.js";

export function itemSeedsFromWorld(world: WorldState): ItemPlacementSeed[] {
  return Object.values(world.items ?? {})
    .filter((item): item is typeof item & { roomId: string } => Boolean(item.roomId))
    .map((item) => ({
      id: item.id,
      templateId: item.templateId,
      roomId: item.roomId,
    }));
}

export async function hydrateWorldItems(
  world: WorldState,
  items: ItemInstanceRepository,
): Promise<void> {
  await items.ensurePlacements(itemSeedsFromWorld(world));
  if (!world.items) {
    world.items = {};
  }
  for (const record of await items.list()) {
    const current = world.items[record.id];
    if (!current) {
      continue;
    }
    current.roomId = record.roomId;
    current.holderCharacterId = record.holderCharacterId;
  }
}
