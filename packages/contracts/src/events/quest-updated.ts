import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";

export const questUpdatedPayloadSchema = z.object({
  characterId: z.string().min(1),
  questId: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(["active", "completed"]),
  completedObjectives: z.array(z.string().min(1)),
  remainingObjectives: z.array(z.string().min(1)),
});

export type QuestUpdatedPayload = z.infer<typeof questUpdatedPayloadSchema>;

export const questUpdatedEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("quest.updated"),
  payload: questUpdatedPayloadSchema,
});

export type QuestUpdatedEvent = z.infer<typeof questUpdatedEventSchema>;

export function formatQuestUpdatedText(payload: QuestUpdatedPayload): string {
  const done = payload.completedObjectives.length;
  const total = done + payload.remainingObjectives.length;
  if (payload.status === "completed") {
    return `You completed ${payload.title}.`;
  }
  if (done === 0) {
    return `Quest started: ${payload.title}.`;
  }
  const latest = payload.completedObjectives[payload.completedObjectives.length - 1];
  return `You finished: ${latest ?? "a step"}. ${payload.title} ${String(done)}/${String(total)}.`;
}
