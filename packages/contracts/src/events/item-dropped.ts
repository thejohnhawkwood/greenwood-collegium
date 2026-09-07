import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";

export const itemDroppedPayloadSchema = z.object({
  itemId: z.string().min(1),
  templateId: z.string().min(1),
  name: z.string().min(1),
  characterId: z.string().min(1),
  characterName: z.string().min(1),
  roomId: z.string().min(1),
});

export type ItemDroppedPayload = z.infer<typeof itemDroppedPayloadSchema>;

export const itemDroppedEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("item.dropped"),
  roomId: z.string().min(1),
  payload: itemDroppedPayloadSchema,
});

export type ItemDroppedEvent = z.infer<typeof itemDroppedEventSchema>;

export function formatItemDroppedText(payload: ItemDroppedPayload, listenerId: string): string {
  if (listenerId === payload.characterId) {
    return `You drop the ${payload.name}.`;
  }
  return `${payload.characterName} drops the ${payload.name}.`;
}
