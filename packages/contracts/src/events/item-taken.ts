import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";

export const itemTakenPayloadSchema = z.object({
  itemId: z.string().min(1),
  templateId: z.string().min(1),
  name: z.string().min(1),
  characterId: z.string().min(1),
  characterName: z.string().min(1),
  roomId: z.string().min(1),
});

export type ItemTakenPayload = z.infer<typeof itemTakenPayloadSchema>;

export const itemTakenEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("item.taken"),
  roomId: z.string().min(1),
  payload: itemTakenPayloadSchema,
});

export type ItemTakenEvent = z.infer<typeof itemTakenEventSchema>;

export function formatItemTakenText(payload: ItemTakenPayload, listenerId: string): string {
  if (listenerId === payload.characterId) {
    return `You take the ${payload.name}.`;
  }
  return `${payload.characterName} takes the ${payload.name}.`;
}
