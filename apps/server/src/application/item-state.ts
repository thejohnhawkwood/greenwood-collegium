import {
  availableToCharacterId,
  ensureCharacterStarterItems,
  type ItemInstance,
  type WorldState,
} from "@greenwood/game-engine";
import type {
  ItemInstanceRecord,
  ItemInstanceRepository,
  ItemPlacementSeed,
} from "../persistence/types.js";

export function itemSeedsFromWorld(world: WorldState): ItemPlacementSeed[] {
  return Object.values(world.items ?? {})
    .filter(
      (item): item is typeof item & { roomId: string } =>
        Boolean(item.roomId) && item.availableToCharacterId === undefined,
    )
    .map((item) => ({
      id: item.id,
      templateId: item.templateId,
      roomId: item.roomId,
    }));
}

export function starterSeedsForCharacter(
  world: WorldState,
  characterId: string,
): ItemPlacementSeed[] {
  return Object.values(world.items ?? {})
    .filter(
      (item): item is typeof item & { roomId: string } =>
        Boolean(item.roomId) && item.availableToCharacterId === characterId,
    )
    .map((item) => ({
      id: item.id,
      templateId: item.templateId,
      roomId: item.roomId,
    }));
}

export async function persistCharacterStarterItems(
  world: WorldState,
  characterId: string,
  items?: Pick<ItemInstanceRepository, "ensurePlacements">,
): Promise<void> {
  ensureCharacterStarterItems(world, characterId);
  if (!items) {
    return;
  }
  const seeds = starterSeedsForCharacter(world, characterId);
  if (seeds.length === 0) {
    return;
  }
  await items.ensurePlacements(seeds);
}

export async function hydrateWorldItems(
  world: WorldState,
  items: ItemInstanceRepository,
): Promise<void> {
  await items.ensurePlacements(itemSeedsFromWorld(world));
  if (!world.items) {
    world.items = {};
  }
  const starterIds = new Set((world.starterPlacements ?? []).map((placement) => placement.id));
  for (const record of await items.list()) {
    if (starterIds.has(record.id) && !record.holderCharacterId) {
      continue;
    }
    const current = world.items[record.id] ?? reconstructWorldItem(world, record);
    if (!current) {
      continue;
    }
    current.roomId = record.roomId;
    current.holderCharacterId = record.holderCharacterId;
    world.items[record.id] = current;
  }
}

function reconstructWorldItem(
  world: WorldState,
  record: ItemInstanceRecord,
): ItemInstance | undefined {
  const template = world.itemTemplates?.[record.templateId];
  if (!template) {
    return undefined;
  }
  return {
    id: record.id,
    templateId: record.templateId,
    name: template.name,
    examineDescription: template.examineDescription,
    roomId: record.roomId,
    holderCharacterId: record.holderCharacterId,
    availableToCharacterId: availableToCharacterId(record.id, world.starterPlacements ?? []),
  };
}
