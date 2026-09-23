import type { EquipmentSlotId } from "@greenwood/contracts";
import type { Character, ItemInstance, WorldState } from "./state.js";

export const EQUIPMENT_SLOT_IDS = [
  "helmet",
  "necklace",
  "cloak",
  "armor",
  "gloves",
  "boots",
  "ring-1",
  "ring-2",
  "main-hand",
  "off-hand",
  "ranged",
] as const satisfies readonly EquipmentSlotId[];

const SLOT_LABELS: Record<EquipmentSlotId, string> = {
  helmet: "Helmet",
  necklace: "Necklace",
  cloak: "Cloak",
  armor: "Armor",
  gloves: "Gloves",
  boots: "Boots",
  "ring-1": "Ring",
  "ring-2": "Ring",
  "main-hand": "Main hand",
  "off-hand": "Off hand",
  ranged: "Ranged",
};

/** Where a template is worn. `two-hand` fills main hand and blocks off hand. `ring` uses the first open ring. */
export type WearClass =
  | "helmet"
  | "necklace"
  | "cloak"
  | "armor"
  | "gloves"
  | "boots"
  | "ring"
  | "main-hand"
  | "off-hand"
  | "ranged"
  | "two-hand";

const WEAR_CLASSES = new Set<string>([
  "helmet",
  "necklace",
  "cloak",
  "armor",
  "gloves",
  "boots",
  "ring",
  "main-hand",
  "off-hand",
  "ranged",
  "two-hand",
]);

export type WearSuccess = {
  ok: true;
  slot: EquipmentSlotId;
  aside: string[];
  bothHands: boolean;
};

export type WearFailure = {
  ok: false;
  message: string;
};

export function wearClass(item: ItemInstance): WearClass | undefined {
  if (item.equipSlot && WEAR_CLASSES.has(item.equipSlot)) {
    return item.equipSlot as WearClass;
  }
  if (item.itemType === "sword") return "main-hand";
  if (item.itemType === "staff") return "two-hand";
  if (item.itemType === "sling") return "ranged";
  if (item.category === "weapon") return "main-hand";
  return undefined;
}

function gearOf(character: Character): Partial<Record<EquipmentSlotId, string>> {
  return { ...(character.equipment ?? {}) };
}

function findWornItem(world: WorldState, itemId: string | undefined): ItemInstance | undefined {
  if (!itemId) return undefined;
  return Object.values(world.items ?? {}).find(
    (item) => item.id === itemId || item.templateId === itemId,
  );
}

function mainIsTwoHanded(
  world: WorldState,
  gear: Partial<Record<EquipmentSlotId, string>>,
): boolean {
  const main = findWornItem(world, gear["main-hand"]);
  return main ? wearClass(main) === "two-hand" : false;
}

/** Place a held item on the paper doll. The item stays in the bag. */
export function wearItem(
  world: WorldState,
  character: Character,
  item: ItemInstance,
): WearSuccess | WearFailure {
  const wear = wearClass(item);
  if (!wear) {
    return { ok: false, message: `You cannot wear the ${item.name}.` };
  }
  const gear = gearOf(character);
  for (const id of EQUIPMENT_SLOT_IDS) {
    if (gear[id] === item.id) delete gear[id];
  }
  const aside: string[] = [];
  const noteAside = (previous: string | undefined) => {
    if (!previous || previous === item.id) return;
    const worn = findWornItem(world, previous);
    if (worn) aside.push(worn.name);
  };

  if (wear === "two-hand") {
    noteAside(gear["off-hand"]);
    delete gear["off-hand"];
    noteAside(gear["main-hand"]);
    gear["main-hand"] = item.id;
    character.equipment = gear;
    character.equippedItemId = item.id;
    return { ok: true, slot: "main-hand", aside, bothHands: true };
  }

  if (wear === "off-hand" && mainIsTwoHanded(world, gear)) {
    const main = findWornItem(world, gear["main-hand"]);
    return {
      ok: false,
      message: main ? `The ${main.name} needs both hands.` : "Both hands are already full.",
    };
  }

  let slot: EquipmentSlotId;
  if (wear === "ring") {
    slot = gear["ring-1"] ? (gear["ring-2"] ? "ring-1" : "ring-2") : "ring-1";
  } else {
    slot = wear;
  }
  noteAside(gear[slot]);
  gear[slot] = item.id;
  character.equipment = gear;
  if (slot === "main-hand") {
    character.equippedItemId = item.id;
  }
  return { ok: true, slot, aside, bothHands: false };
}

export function takeOff(
  world: WorldState,
  character: Character,
  target: string,
): { ok: true; name: string } | { ok: false; message: string } {
  const needle = target.trim().toLowerCase();
  if (!needle) {
    return { ok: false, message: "Unequip what?" };
  }
  const gear = gearOf(character);
  const labelMatches = (id: EquipmentSlotId) => {
    const label = SLOT_LABELS[id].toLowerCase();
    return id === needle || label === needle || label.replace(" ", "") === needle.replace(" ", "");
  };
  const slot =
    EQUIPMENT_SLOT_IDS.find((id) => Boolean(gear[id]) && labelMatches(id)) ??
    EQUIPMENT_SLOT_IDS.find((id) => {
      const worn = findWornItem(world, gear[id]);
      return worn ? worn.name.toLowerCase().includes(needle) || worn.id === needle : false;
    });
  const itemId = slot ? gear[slot] : undefined;
  const item = findWornItem(world, itemId);
  if (!item || !itemId) {
    return { ok: false, message: "You are not wearing that." };
  }
  clearWornItem(character, item);
  return { ok: true, name: item.name };
}

/** Keep only worn items this Collegian still holds. */
export function restoreEquipment(
  world: WorldState,
  character: Character,
  stored: Partial<Record<EquipmentSlotId, string>>,
): void {
  const gear: Partial<Record<EquipmentSlotId, string>> = {};
  for (const id of EQUIPMENT_SLOT_IDS) {
    const itemId = stored[id];
    const item = findWornItem(world, itemId);
    if (!item || item.holderCharacterId !== character.id) {
      continue;
    }
    gear[id] = item.id;
  }
  character.equipment = gear;
  character.equippedItemId = gear["main-hand"];
}

export function clearWornItem(character: Character, item: ItemInstance): void {
  const gear = gearOf(character);
  let clearedMain = false;
  for (const id of EQUIPMENT_SLOT_IDS) {
    if (gear[id] === item.id || gear[id] === item.templateId) {
      if (id === "main-hand") clearedMain = true;
      delete gear[id];
    }
  }
  character.equipment = gear;
  if (
    clearedMain ||
    character.equippedItemId === item.id ||
    character.equippedItemId === item.templateId
  ) {
    character.equippedItemId = undefined;
  }
}

export function equipmentSheet(
  world: WorldState,
  character: Character,
): Array<{
  id: EquipmentSlotId;
  label: string;
  itemId?: string;
  itemName?: string;
  blocked?: boolean;
}> {
  const gear = gearOf(character);
  if (!gear["main-hand"] && character.equippedItemId) {
    gear["main-hand"] = character.equippedItemId;
  }
  const main = findWornItem(world, gear["main-hand"]);
  const twoHand = main ? wearClass(main) === "two-hand" : false;
  return EQUIPMENT_SLOT_IDS.map((id) => {
    if (id === "off-hand" && twoHand && main) {
      return { id, label: SLOT_LABELS[id], blocked: true, itemName: main.name };
    }
    const item = findWornItem(world, gear[id]);
    return {
      id,
      label: SLOT_LABELS[id],
      ...(item ? { itemId: item.id, itemName: item.name } : {}),
    };
  });
}

export function wornSlotId(
  world: WorldState,
  character: Character,
  itemId: string,
): EquipmentSlotId | undefined {
  return equipmentSheet(world, character).find((slot) => slot.itemId === itemId)?.id;
}
