import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";
import { roomExitSchema } from "./room-snapshot.js";

export const mapDiscoveredPayloadSchema = z.object({
  roomId: z.string().min(1),
  title: z.string().min(1),
  method: z.enum(["movement"]),
  exits: z.array(roomExitSchema),
});

export type MapDiscoveredPayload = z.infer<typeof mapDiscoveredPayloadSchema>;

export const mapDiscoveredEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("map.discovered"),
  roomId: z.string().min(1),
  payload: mapDiscoveredPayloadSchema,
});

export type MapDiscoveredEvent = z.infer<typeof mapDiscoveredEventSchema>;

export function formatMapDiscoveredText(payload: MapDiscoveredPayload): string {
  return `You have discovered ${payload.title}.`;
}
