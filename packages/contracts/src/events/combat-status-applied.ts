import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";

export const combatStatusAppliedPayloadSchema = z.object({
  encounterId: z.string().min(1),
  targetId: z.string().min(1),
  targetName: z.string().min(1),
  statusId: z.literal("burning"),
  remainingRounds: z.number().int().nonnegative(),
  phase: z.enum(["applied", "tick", "ended"]),
  tickDamage: z.number().int().nonnegative().optional(),
  targetHealth: z.number().int().nonnegative().optional(),
  targetMaxHealth: z.number().int().positive().optional(),
});

export type CombatStatusAppliedPayload = z.infer<typeof combatStatusAppliedPayloadSchema>;

export const combatStatusAppliedEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("combat.status_applied"),
  encounterId: z.string().min(1),
  payload: combatStatusAppliedPayloadSchema,
});

export type CombatStatusAppliedEvent = z.infer<typeof combatStatusAppliedEventSchema>;

export function formatCombatStatusAppliedText(payload: CombatStatusAppliedPayload): string {
  if (payload.phase === "applied") {
    return `The ${payload.targetName} is burning (${String(payload.remainingRounds)} rounds).`;
  }
  if (payload.phase === "ended") {
    return `The fire on the ${payload.targetName} goes out.`;
  }
  const remaining =
    payload.remainingRounds === 1
      ? "Burning: 1 round."
      : `Burning: ${String(payload.remainingRounds)} rounds.`;
  return `The ${payload.targetName} smoulders for ${String(payload.tickDamage ?? 0)}. It has ${String(payload.targetHealth ?? 0)} remaining. ${remaining}`;
}
