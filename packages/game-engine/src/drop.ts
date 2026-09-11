import {
  formatInventoryUpdatedText,
  formatItemDroppedText,
  inventoryUpdatedEventSchema,
  itemDroppedEventSchema,
  renderClassicSegments,
  schemaVersion,
  type InventoryUpdatedEvent,
  type ItemDroppedEvent,
} from "@greenwood/contracts";
import { rejectIfInCombat } from "./combat-state.js";
import { itemsHeldBy, resolveTypedItems, whichItemMessage } from "./items.js";
import { charactersInRoom } from "./occupants.js";
import type { OccupantNotice } from "./presence-events.js";
import type { DropIntent, EngineRuntime, ItemInstance, WorldState } from "./state.js";

export type DropSuccess = {
  ok: true;
  itemId: string;
  roomId: string;
  events: Array<ItemDroppedEvent | InventoryUpdatedEvent>;
  notices: OccupantNotice[];
};

export type DropFailure = {
  ok: false;
  code:
    "character_not_found" | "room_not_found" | "item_not_found" | "item_ambiguous" | "in_combat";
  message: string;
};

export type DropResult = DropSuccess | DropFailure;

export function revertDrop(item: ItemInstance, characterId: string): void {
  item.holderCharacterId = characterId;
  item.roomId = undefined;
}

export function handleDrop(
  world: WorldState,
  intent: DropIntent,
  runtime: EngineRuntime,
): DropResult {
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

  const resolved = resolveTypedItems(itemsHeldBy(world, character.id), intent.target);
  if (resolved.status === "none") {
    return {
      ok: false,
      code: "item_not_found",
      message: `You are not carrying "${intent.target}".`,
    };
  }
  if (resolved.status === "many") {
    return {
      ok: false,
      code: "item_ambiguous",
      message: whichItemMessage("drop", resolved.typeWord, resolved.items),
    };
  }

  const item = resolved.item;

  item.holderCharacterId = undefined;
  item.roomId = room.id;

  const payload = {
    itemId: item.id,
    templateId: item.templateId,
    name: item.name,
    characterId: character.id,
    characterName: character.name,
    roomId: room.id,
  };
  const actorNarration = formatItemDroppedText(payload, character.id);
  const actorSegments = [
    { kind: "text" as const, text: "You drop the " },
    { kind: "item" as const, id: item.id, text: item.name },
    { kind: "text" as const, text: "." },
  ];
  if (renderClassicSegments(actorSegments) !== actorNarration) {
    throw new Error("classic segments drifted from item.dropped narration");
  }

  const dropped = itemDroppedEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(character.id),
    schemaVersion,
    type: "item.dropped",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    roomId: room.id,
    narration: actorNarration,
    segments: actorSegments,
    payload,
  } satisfies ItemDroppedEvent);

  const inventoryPayload = {
    characterId: character.id,
    items: itemsHeldBy(world, character.id).map((held) => ({
      itemId: held.id,
      templateId: held.templateId,
      name: held.name,
    })),
  };
  const inventory = inventoryUpdatedEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(character.id),
    schemaVersion,
    type: "inventory.updated",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    narration: formatInventoryUpdatedText(inventoryPayload),
    payload: inventoryPayload,
  } satisfies InventoryUpdatedEvent);

  const observerNarration = formatItemDroppedText(payload, "observer");
  const observerSegments = [
    { kind: "actor" as const, id: character.id, text: character.name },
    { kind: "text" as const, text: " drops the " },
    { kind: "item" as const, id: item.id, text: item.name },
    { kind: "text" as const, text: "." },
  ];
  if (renderClassicSegments(observerSegments) !== observerNarration) {
    throw new Error("classic segments drifted from item.dropped observer narration");
  }

  const notices = charactersInRoom(world, room.id, character.id).map((observer) => {
    const event = itemDroppedEventSchema.parse({
      eventId: runtime.nextEventId(),
      sequence: runtime.nextSequence(observer.id),
      schemaVersion,
      type: "item.dropped",
      occurredAt: runtime.now().toISOString(),
      audience: "character",
      roomId: room.id,
      narration: observerNarration,
      segments: observerSegments,
      payload,
    } satisfies ItemDroppedEvent);
    return { characterId: observer.id, event };
  });

  return {
    ok: true,
    itemId: item.id,
    roomId: room.id,
    events: [dropped, inventory],
    notices,
  };
}
