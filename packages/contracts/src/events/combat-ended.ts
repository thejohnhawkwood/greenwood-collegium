import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";

export const combatEndedPayloadSchema = z.object({
  encounterId: z.string().min(1),
  characterId: z.string().min(1),
  roomId: z.string().min(1),
  enemyName: z.string().min(1),
  outcome: z.enum(["victory", "defeat", "fled"]),
});

export type CombatEndedPayload = z.infer<typeof combatEndedPayloadSchema>;

export const combatEndedEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("combat.ended"),
  roomId: z.string().min(1),
  encounterId: z.string().min(1),
  payload: combatEndedPayloadSchema,
});

export type CombatEndedEvent = z.infer<typeof combatEndedEventSchema>;

export function formatCombatEndedText(payload: CombatEndedPayload): string {
  if (payload.outcome === "victory") {
    return `The ${payload.enemyName} topples. The lesson is over.`;
  }
  if (payload.outcome === "fled") {
    return "You break from the lesson and step back.";
  }
  return "The lesson ends. You wake in the Infirmary, unhurt.";
}
