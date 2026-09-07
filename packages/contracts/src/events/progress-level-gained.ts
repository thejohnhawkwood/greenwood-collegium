import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";

export const levelGainedPayloadSchema = z.object({
  characterId: z.string().min(1),
  level: z.number().int().positive(),
  experience: z.number().int().nonnegative(),
});

export type LevelGainedPayload = z.infer<typeof levelGainedPayloadSchema>;

export const levelGainedEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("progress.level_gained"),
  payload: levelGainedPayloadSchema,
});

export type LevelGainedEvent = z.infer<typeof levelGainedEventSchema>;

export function formatLevelGainedText(payload: LevelGainedPayload): string {
  return `You reach Level ${String(payload.level)}.`;
}
