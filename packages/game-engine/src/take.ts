import {
  formatInventoryUpdatedText,
  formatItemTakenText,
  inventoryUpdatedEventSchema,
  itemTakenEventSchema,
  renderClassicSegments,
  schemaVersion,
  type InventoryUpdatedEvent,
  type ItemTakenEvent,
} from "@greenwood/contracts";
import type { EventEnvelope } from "@greenwood/contracts";
import {
  ARRIVAL_KEY_TEMPLATE_ID,
  PORTER_TAKE_HINT,
  arrivalNeedsTake,
  fixturesVisibleTo,
  isExactArrivalKeyName,
} from "./arrival-guide.js";
import { rejectIfInCombat } from "./combat-state.js";
import { formatDialogueNode, misfitNodeId, treeNode } from "./conversation.js";
import { speciesWeaponFit, weaponFeelLine } from "./equipment.js";
import { itemsHeldBy, itemsInRoom, resolveTypedItems, whichItemMessage } from "./items.js";
import { ensureCharacterStarterItems } from "./starter-items.js";
import { charactersInRoom } from "./occupants.js";
import type { OccupantNotice } from "./presence-events.js";
import type { EngineRuntime, ItemInstance, TakeIntent, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export type TakeSuccess = {
  ok: true;
  itemId: string;
  roomId: string;
  persist?: boolean;
  events: Array<ItemTakenEvent | InventoryUpdatedEvent | EventEnvelope>;
  notices: OccupantNotice[];
};

export type TakeFailure = {
  ok: false;
  code:
    | "character_not_found"
    | "room_not_found"
    | "item_not_found"
    | "item_ambiguous"
    | "already_taken"
    | "in_combat";
  message: string;
};

export type TakeResult = TakeSuccess | TakeFailure;

export function revertTake(item: ItemInstance, roomId: string): void {
  item.holderCharacterId = undefined;
  item.roomId = roomId;
}

export function handleTake(
  world: WorldState,
  intent: TakeIntent,
  runtime: EngineRuntime,
): TakeResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }

  const room = world.rooms[character.roomId];
  if (!room) {
    return {
      ok: false,
      code: "room_not_found",
      message: `The room "${character.roomId}" is missing.`,
    };
  }

  const blocked = rejectIfInCombat(world, character.id);
  if (blocked) {
    return blocked;
  }

  ensureCharacterStarterItems(world, character.id);
  const visible = itemsInRoom(world, room.id, character.id);
  const target = intent.target.trim();
  if (target.length === 0) {
    if (arrivalNeedsTake(world, character.id) && visible.some(isArrivalKey)) {
      return { ok: false, code: "item_not_found", message: PORTER_TAKE_HINT };
    }
    return { ok: false, code: "item_not_found", message: "Take what?" };
  }

  if (blocksArrivalKeyShortcut(world, character.id, target, visible)) {
    return { ok: false, code: "item_not_found", message: PORTER_TAKE_HINT };
  }

  const resolved = resolveTypedItems(visible, target);
  if (resolved.status === "none") {
    if (arrivalNeedsTake(world, character.id) && looksLikeKeyAttempt(target)) {
      return { ok: false, code: "item_not_found", message: PORTER_TAKE_HINT };
    }
    return {
      ok: false,
      code: "item_not_found",
      message: `I do not see "${intent.target}" here.`,
    };
  }
  if (resolved.status === "many") {
    return {
      ok: false,
      code: "item_ambiguous",
      message: whichItemMessage("take", resolved.typeWord, resolved.items),
    };
  }

  const item = resolved.item;
  if (item.holderCharacterId) {
    return {
      ok: false,
      code: "already_taken",
      message: `The ${item.name} is no longer here.`,
    };
  }

  if (item.training || item.category === "weapon") {
    return equipTrainingWeapon(world, character.id, item, room.id, runtime);
  }

  item.holderCharacterId = character.id;
  item.roomId = undefined;

  const payload = {
    itemId: item.id,
    templateId: item.templateId,
    name: item.name,
    characterId: character.id,
    characterName: character.name,
    roomId: room.id,
  };
  const actorNarration = formatItemTakenText(payload, character.id);
  const actorSegments = [
    { kind: "text" as const, text: "You take the " },
    { kind: "item" as const, id: item.id, text: item.name },
    { kind: "text" as const, text: "." },
  ];
  if (renderClassicSegments(actorSegments) !== actorNarration) {
    throw new Error("classic segments drifted from item.taken narration");
  }

  const taken = itemTakenEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(character.id),
    schemaVersion,
    type: "item.taken",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    roomId: room.id,
    narration: actorNarration,
    segments: actorSegments,
    payload,
  } satisfies ItemTakenEvent);

  const inventoryPayload = {
    characterId: character.id,
    items: itemsHeldBy(world, character.id).map((held) => ({
      itemId: held.id,
      templateId: held.templateId,
      name: held.name,
    })),
  };
  const inventoryNarration = formatInventoryUpdatedText(inventoryPayload);
  const inventory = inventoryUpdatedEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(character.id),
    schemaVersion,
    type: "inventory.updated",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    narration: inventoryNarration,
    payload: inventoryPayload,
  } satisfies InventoryUpdatedEvent);

  const observerNarration = formatItemTakenText(payload, "observer");
  const observerSegments = [
    { kind: "actor" as const, id: character.id, text: character.name },
    { kind: "text" as const, text: " takes the " },
    { kind: "item" as const, id: item.id, text: item.name },
    { kind: "text" as const, text: "." },
  ];
  if (renderClassicSegments(observerSegments) !== observerNarration) {
    throw new Error("classic segments drifted from item.taken observer narration");
  }

  const notices = charactersInRoom(world, room.id, character.id).map((observer) => {
    const event = itemTakenEventSchema.parse({
      eventId: runtime.nextEventId(),
      sequence: runtime.nextSequence(observer.id),
      schemaVersion,
      type: "item.taken",
      occurredAt: runtime.now().toISOString(),
      audience: "character",
      roomId: room.id,
      narration: observerNarration,
      segments: observerSegments,
      payload,
    } satisfies ItemTakenEvent);
    return { characterId: observer.id, event };
  });

  return {
    ok: true,
    itemId: item.id,
    roomId: room.id,
    events: [taken, inventory],
    notices,
  };
}

function isArrivalKey(item: ItemInstance): boolean {
  return item.templateId === ARRIVAL_KEY_TEMPLATE_ID;
}

function looksLikeKeyAttempt(target: string): boolean {
  return /\bkeys?\b/iu.test(target) || /cooper/iu.test(target);
}

function blocksArrivalKeyShortcut(
  world: WorldState,
  characterId: string,
  target: string,
  visible: readonly ItemInstance[],
): boolean {
  if (!arrivalNeedsTake(world, characterId)) {
    return false;
  }
  if (isExactArrivalKeyName(target)) {
    return false;
  }
  if (looksLikeKeyAttempt(target)) {
    return true;
  }
  const resolved = resolveTypedItems(visible, target);
  return resolved.status === "one" && isArrivalKey(resolved.item);
}

function equipTrainingWeapon(
  world: WorldState,
  characterId: string,
  item: ItemInstance,
  roomId: string,
  runtime: EngineRuntime,
): TakeSuccess | TakeFailure {
  const character = world.characters[characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${characterId}".`,
    };
  }
  character.equippedItemId = item.templateId;
  const fit = speciesWeaponFit(world, character, item);
  const lines = [`You take the ${item.name}.`, "", weaponFeelLine(item, fit)];
  if (fit === "misfit") {
    const treeText = openFlintMisfit(world, character);
    lines.push("");
    lines.push(
      treeText ??
        'Instructor Flint clicks her tongue. "That is a poor fit. Type talk flint if you want to learn why."',
    );
  }
  return {
    ok: true,
    itemId: item.id,
    roomId,
    persist: false,
    events: [systemNotice(character.id, lines.join("\n"), runtime)],
    notices: [],
  };
}

function openFlintMisfit(
  world: WorldState,
  character: { id: string; openConversation?: { npcId: string; nodeId: string } },
): string | undefined {
  const actor = world.characters[character.id];
  if (!actor) {
    return undefined;
  }
  const flint = fixturesVisibleTo(world, actor).find(
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
