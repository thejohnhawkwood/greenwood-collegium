import type { EventEnvelope } from "@greenwood/contracts";
import { fixturesVisibleTo } from "./arrival-guide.js";
import { formatDialogueNode, misfitNodeId, treeNode } from "./conversation.js";
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
  code: "character_not_found" | "item_not_found" | "item_ambiguous";
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
  setEquippedItem(character, item);
  const fit = speciesWeaponFit(world, character, item);
  const lines = [`You equip the ${item.name}.`, "", weaponFeelLine(item, fit)];
  if (fit === "misfit") {
    const treeText = openFlintMisfit(world, character.id);
    if (treeText) {
      lines.push("");
      lines.push(treeText);
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

function openFlintMisfit(world: WorldState, characterId: string): string | undefined {
  const character = world.characters[characterId];
  if (!character) {
    return undefined;
  }
  const flint = fixturesVisibleTo(world, character).find(
    (fixture) => fixture.id === "npc-instructor-flint",
  );
  const tree = flint?.dialogueTree;
  if (!tree) {
    return undefined;
  }
  const nodeId = misfitNodeId(tree) ?? tree.start;
  const node = treeNode(tree, nodeId);
  if (!node) {
    return undefined;
  }
  character.openConversation = { npcId: "npc-instructor-flint", nodeId };
  return formatDialogueNode(flint?.name ?? "Instructor Flint", node);
}
