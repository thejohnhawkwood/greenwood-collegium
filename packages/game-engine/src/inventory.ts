import {
  formatInventoryUpdatedText,
  inventoryUpdatedEventSchema,
  schemaVersion,
  type InventoryUpdatedEvent,
} from "@greenwood/contracts";
import { itemsHeldBy } from "./items.js";
import type { EngineRuntime, InventoryIntent, WorldState } from "./state.js";

export type InventorySuccess = {
  ok: true;
  event: InventoryUpdatedEvent;
};

export type InventoryFailure = {
  ok: false;
  code: "character_not_found";
  message: string;
};

export type InventoryResult = InventorySuccess | InventoryFailure;

export function handleInventory(
  world: WorldState,
  intent: InventoryIntent,
  runtime: EngineRuntime,
): InventoryResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }

  const payload = {
    characterId: character.id,
    items: itemsHeldBy(world, character.id).map((item) => ({
      itemId: item.id,
      templateId: item.templateId,
      name: item.name,
    })),
  };
  const event = inventoryUpdatedEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(character.id),
    schemaVersion,
    type: "inventory.updated",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    narration: formatInventoryUpdatedText(payload),
    payload,
  } satisfies InventoryUpdatedEvent);

  return { ok: true, event };
}
