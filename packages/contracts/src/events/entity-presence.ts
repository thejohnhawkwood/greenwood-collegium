import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";

export const entityPresencePayloadSchema = z.object({
  characterId: z.string().min(1),
  name: z.string().min(1),
  roomId: z.string().min(1),
  direction: z.string().min(1).optional(),
});

export type EntityPresencePayload = z.infer<typeof entityPresencePayloadSchema>;

export const entityEnteredEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("entity.entered"),
  roomId: z.string().min(1),
  payload: entityPresencePayloadSchema,
});

export const entityLeftEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("entity.left"),
  roomId: z.string().min(1),
  payload: entityPresencePayloadSchema,
});

export type EntityEnteredEvent = z.infer<typeof entityEnteredEventSchema>;
export type EntityLeftEvent = z.infer<typeof entityLeftEventSchema>;

export function formatEntityEnteredText(payload: EntityPresencePayload): string {
  if (payload.direction) {
    return `${payload.name} arrives from the ${payload.direction}.`;
  }
  return `${payload.name} arrives.`;
}

export function formatEntityLeftText(payload: EntityPresencePayload): string {
  if (payload.direction) {
    return `${payload.name} leaves ${payload.direction}.`;
  }
  return `${payload.name} has left.`;
}
