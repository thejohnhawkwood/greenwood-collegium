import type { ItemInstance, WorldState } from "./state.js";

export function worldItems(world: WorldState): Record<string, ItemInstance> {
  if (!world.items) {
    world.items = {};
  }
  return world.items;
}

export function itemsInRoom(
  world: WorldState,
  roomId: string,
  viewerCharacterId?: string,
): ItemInstance[] {
  return Object.values(worldItems(world)).filter((item) => {
    if (item.roomId !== roomId) {
      return false;
    }
    if (
      item.availableToCharacterId !== undefined &&
      item.availableToCharacterId !== viewerCharacterId
    ) {
      return false;
    }
    return true;
  });
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

export function itemTypeWord(item: { category?: string; itemType?: string }): string {
  if (item.itemType) {
    return item.itemType.toLowerCase();
  }
  if (item.category && item.category !== "ordinary") {
    return item.category.toLowerCase();
  }
  return "item";
}

export function whichItemMessage(
  verb: string,
  typeWord: string,
  items: readonly { name: string }[],
): string {
  const commands = items.map((item) => `${verb} ${item.name}`);
  if (commands.length === 0) {
    return `Which ${typeWord}?`;
  }
  if (commands.length === 1) {
    return `Which ${typeWord}? Type ${commands[0]}.`;
  }
  const last = commands[commands.length - 1];
  return `Which ${typeWord}? Type ${commands.slice(0, -1).join(" or ")} or ${last}.`;
}

export type ResolvedItems =
  | { status: "none" }
  | { status: "one"; item: ItemInstance }
  | { status: "many"; items: ItemInstance[]; typeWord: string };

export function resolveTypedItems(
  candidates: readonly ItemInstance[],
  target: string,
): ResolvedItems {
  const needle = target.trim().toLowerCase().replace(/\s+/gu, " ");
  if (needle.length === 0) {
    return { status: "none" };
  }

  const exact = candidates.filter((item) => {
    const name = item.name.toLowerCase().replace(/\s+/gu, " ");
    return item.id === needle || item.templateId === needle || name === needle;
  });
  if (exact.length === 1 && exact[0]) {
    return { status: "one", item: exact[0] };
  }
  if (exact.length > 1) {
    return { status: "many", items: exact, typeWord: itemTypeWord(exact[0] ?? {}) };
  }

  const byType = candidates.filter((item) => {
    const type = itemTypeWord(item);
    const category = (item.category ?? type).toLowerCase();
    return type === needle || category === needle;
  });
  if (byType.length === 1 && byType[0]) {
    return { status: "one", item: byType[0] };
  }
  if (byType.length > 1) {
    return { status: "many", items: byType, typeWord: needle };
  }

  const named = matchItems(candidates, target);
  if (named.length === 1 && named[0]) {
    return { status: "one", item: named[0] };
  }
  if (named.length > 1) {
    return { status: "many", items: named, typeWord: itemTypeWord(named[0] ?? {}) };
  }
  return { status: "none" };
}
