import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";

export const sessionSnapshotPayloadSchema = z.object({
  characterId: z.string().min(1),
  characterName: z.string().min(1),
  roomId: z.string().min(1),
  lastSequence: z.number().int().nonnegative(),
});

export type SessionSnapshotPayload = z.infer<typeof sessionSnapshotPayloadSchema>;

export const sessionSnapshotEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("session.snapshot"),
  roomId: z.string().min(1),
  payload: sessionSnapshotPayloadSchema,
});

export type SessionSnapshotEvent = z.infer<typeof sessionSnapshotEventSchema>;

export function formatSessionSnapshotText(
  payload: SessionSnapshotPayload,
  roomTitle: string,
): string {
  return `You are still in ${roomTitle}.`;
}
