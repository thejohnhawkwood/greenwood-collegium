import { z } from "zod";
import { schemaVersion } from "../schema-version.js";
import { semanticSegmentSchema } from "./segments.js";
import { eventAudienceSchema, eventTypeSchema } from "./types.js";

export const eventEnvelopeSchema = z.object({
  eventId: z.string().min(1),
  sequence: z.number().int().nonnegative(),
  schemaVersion: z.literal(schemaVersion),
  type: eventTypeSchema,
  occurredAt: z.string().min(1),
  audience: eventAudienceSchema,
  roomId: z.string().min(1).optional(),
  encounterId: z.string().min(1).optional(),
  narration: z.string().min(1),
  segments: z.array(semanticSegmentSchema).optional(),
  presentationKey: z.string().min(1).optional(),
  payload: z.unknown(),
});

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;

export function renderClassicNarration(event: Pick<EventEnvelope, "narration">): string {
  return event.narration;
}
