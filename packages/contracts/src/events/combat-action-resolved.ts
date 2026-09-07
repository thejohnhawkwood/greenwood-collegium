import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";

export const combatActionResolvedPayloadSchema = z.object({
  encounterId: z.string().min(1),
  actorId: z.string().min(1),
  actorName: z.string().min(1),
  actorKind: z.enum(["player", "enemy"]),
  verb: z.literal("attack"),
  targetId: z.string().min(1),
  targetName: z.string().min(1),
  damage: z.number().int().nonnegative(),
  targetHealth: z.number().int().nonnegative(),
  targetMaxHealth: z.number().int().positive(),
});

export type CombatActionResolvedPayload = z.infer<typeof combatActionResolvedPayloadSchema>;

export const combatActionResolvedEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("combat.action_resolved"),
  encounterId: z.string().min(1),
  payload: combatActionResolvedPayloadSchema,
});

export type CombatActionResolvedEvent = z.infer<typeof combatActionResolvedEventSchema>;

export function formatCombatActionResolvedText(payload: CombatActionResolvedPayload): string {
  if (payload.actorKind === "player") {
    return `You strike the ${payload.targetName} for ${String(payload.damage)}. It has ${String(payload.targetHealth)} remaining.`;
  }
  return `The ${payload.actorName} thumps you for ${String(payload.damage)}. You have ${String(payload.targetHealth)} remaining.`;
}
