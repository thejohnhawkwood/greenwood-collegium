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
import { rejectIfInCombat } from "./combat-state.js";
import { itemsHeldBy, itemsInRoom, matchItems } from "./items.js";
import { ensureCharacterStarterItems } from "./starter-items.js";
import { charactersInRoom } from "./occupants.js";
import type { OccupantNotice } from "./presence-events.js";
import type { EngineRuntime, ItemInstance, TakeIntent, WorldState } from "./state.js";

export type TakeSuccess = {
  ok: true;
  itemId: string;
  roomId: string;
  events: Array<ItemTakenEvent | InventoryUpdatedEvent>;
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
  const matches = matchItems(itemsInRoom(world, room.id, character.id), intent.target);
  if (matches.length === 0) {
    return {
      ok: false,
      code: "item_not_found",
      message: `I do not see "${intent.target}" here.`,
    };
  }
  if (matches.length > 1) {
    const names = matches.map((item) => item.name).join(", ");
    return {
      ok: false,
      code: "item_ambiguous",
      message: `Which did you mean: ${names}?`,
    };
  }

  const item = matches[0];
  if (!item || item.holderCharacterId) {
    return {
      ok: false,
      code: "already_taken",
      message: `The ${item?.name ?? intent.target} is no longer here.`,
    };
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
