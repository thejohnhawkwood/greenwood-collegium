import type { EventEnvelope } from "@greenwood/contracts";
import { fixturesVisibleTo } from "./arrival-guide.js";
import { misfitNodeId, treeNode } from "./conversation.js";
import { setEquippedItem, speciesWeaponFit, weaponFeelLine } from "./equipment.js";
import { itemsHeldBy, itemsInRoom, resolveTypedItems, whichItemMessage } from "./items.js";
import type { EngineRuntime, EquipIntent, ItemInstance, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export type EquipSuccess = {
  ok: true;
  event: EventEnvelope;
};

export type EquipFailure = {
  ok: false;
  code: "character_not_found" | "item_not_found" | "item_ambiguous" | "not_wearable";
  message: string;
};

export type EquipResult = EquipSuccess | EquipFailure;

export function handleEquip(
  world: WorldState,
  intent: EquipIntent,
  runtime: EngineRuntime,
): EquipResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }

  const target = intent.target.trim();
  if (target.length === 0) {
    return { ok: false, code: "item_not_found", message: "Equip what?" };
  }

  const candidates = equipCandidates(world, character.id, character.roomId);
  const resolved = resolveTypedItems(candidates, target);
  if (resolved.status === "none") {
    return {
      ok: false,
      code: "item_not_found",
      message: `You cannot equip "${intent.target}" here.`,
    };
  }
  if (resolved.status === "many") {
    return {
      ok: false,
      code: "item_ambiguous",
      message: whichItemMessage("equip", resolved.typeWord, resolved.items),
    };
  }

  const item = resolved.item;
  const worn = setEquippedItem(world, character, item);
  if (!worn.ok) {
    return { ok: false, code: "not_wearable", message: worn.message };
  }
  const fit = speciesWeaponFit(world, character, item);
  const lines = [`You equip the ${item.name}.`];
  if (worn.bothHands) lines.push("It needs both hands.");
  for (const name of worn.aside) lines.push(`You set the ${name} aside.`);
  if (item.category === "weapon") {
    lines.push("", weaponFeelLine(item, fit));
  }
  if (fit === "misfit") {
    if (openFlintMisfit(world, character.id)) {
      lines.push("");
      lines.push("Instructor Flint watches the poor fit.");
    }
  }
  return { ok: true, event: systemNotice(character.id, lines.join("\n"), runtime) };
}

function equipCandidates(world: WorldState, characterId: string, roomId: string): ItemInstance[] {
  const held = itemsHeldBy(world, characterId);
  const visible = itemsInRoom(world, roomId, characterId).filter(
    (item) => item.training || item.category === "weapon",
  );
  const seen = new Set<string>();
  const merged: ItemInstance[] = [];
  for (const item of [...held, ...visible]) {
    if (seen.has(item.id)) {
      continue;
    }
    seen.add(item.id);
    merged.push(item);
  }
  return merged;
}

function openFlintMisfit(world: WorldState, characterId: string): boolean {
  const character = world.characters[characterId];
  if (!character) {
    return false;
  }
  const flint = fixturesVisibleTo(world, character).find(
    (fixture) => fixture.id === "npc-instructor-flint",
  );
  const tree = flint?.dialogueTree;
  if (!tree) {
    return false;
  }
  const nodeId = misfitNodeId(tree) ?? tree.start;
  const node = treeNode(tree, nodeId);
  if (!node) {
    return false;
  }
  character.openConversation = { npcId: "npc-instructor-flint", nodeId };
  return true;
}
