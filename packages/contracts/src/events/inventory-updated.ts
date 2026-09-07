import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";

export const inventoryItemSchema = z.object({
  itemId: z.string().min(1),
  templateId: z.string().min(1),
  name: z.string().min(1),
});

export const inventoryUpdatedPayloadSchema = z.object({
  characterId: z.string().min(1),
  items: z.array(inventoryItemSchema),
});

export type InventoryUpdatedPayload = z.infer<typeof inventoryUpdatedPayloadSchema>;

export const inventoryUpdatedEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("inventory.updated"),
  payload: inventoryUpdatedPayloadSchema,
});

export type InventoryUpdatedEvent = z.infer<typeof inventoryUpdatedEventSchema>;

export function formatInventoryUpdatedText(payload: InventoryUpdatedPayload): string {
  if (payload.items.length === 0) {
    return "You are not carrying anything.";
  }
  const lines = ["You are carrying:"];
  for (const item of payload.items) {
    lines.push(`  ${item.name}`);
  }
  return lines.join("\n");
}
