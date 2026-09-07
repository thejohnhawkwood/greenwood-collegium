import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";

export const combatStartedPayloadSchema = z.object({
  encounterId: z.string().min(1),
  roomId: z.string().min(1),
  characterId: z.string().min(1),
  characterName: z.string().min(1),
  enemyId: z.string().min(1),
  enemyName: z.string().min(1),
  enemyHealth: z.number().int().nonnegative(),
  enemyMaxHealth: z.number().int().positive(),
});

export type CombatStartedPayload = z.infer<typeof combatStartedPayloadSchema>;

export const combatStartedEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("combat.started"),
  roomId: z.string().min(1),
  encounterId: z.string().min(1),
  payload: combatStartedPayloadSchema,
});

export type CombatStartedEvent = z.infer<typeof combatStartedEventSchema>;

export function formatCombatStartedText(payload: CombatStartedPayload): string {
  return `You square up to the ${payload.enemyName}.`;
}
