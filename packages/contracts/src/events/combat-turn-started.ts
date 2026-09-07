import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";

export const combatTurnStartedPayloadSchema = z.object({
  encounterId: z.string().min(1),
  round: z.number().int().positive(),
  actorId: z.string().min(1),
  actorName: z.string().min(1),
});

export type CombatTurnStartedPayload = z.infer<typeof combatTurnStartedPayloadSchema>;

export const combatTurnStartedEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("combat.turn_started"),
  encounterId: z.string().min(1),
  payload: combatTurnStartedPayloadSchema,
});

export type CombatTurnStartedEvent = z.infer<typeof combatTurnStartedEventSchema>;

export function formatCombatTurnStartedText(payload: CombatTurnStartedPayload): string {
  return `Round ${String(payload.round)}. It is your turn.`;
}
