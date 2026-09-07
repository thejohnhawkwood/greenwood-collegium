import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";

export const experienceGainedPayloadSchema = z.object({
  characterId: z.string().min(1),
  amount: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export type ExperienceGainedPayload = z.infer<typeof experienceGainedPayloadSchema>;

export const experienceGainedEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("progress.experience_gained"),
  payload: experienceGainedPayloadSchema,
});

export type ExperienceGainedEvent = z.infer<typeof experienceGainedEventSchema>;

export function formatExperienceGainedText(payload: ExperienceGainedPayload): string {
  return `You gain ${String(payload.amount)} experience.`;
}
