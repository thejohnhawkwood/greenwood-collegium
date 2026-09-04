import { z } from "zod";
import { eventEnvelopeSchema } from "./envelope.js";

export const chatSaidPayloadSchema = z.object({
  speakerId: z.string().min(1),
  speakerName: z.string().min(1),
  roomId: z.string().min(1),
  text: z.string().min(1),
});

export type ChatSaidPayload = z.infer<typeof chatSaidPayloadSchema>;

export const chatSaidEventSchema = eventEnvelopeSchema.extend({
  type: z.literal("chat.said"),
  roomId: z.string().min(1),
  payload: chatSaidPayloadSchema,
});

export type ChatSaidEvent = z.infer<typeof chatSaidEventSchema>;

export function formatChatSaidText(payload: ChatSaidPayload, listenerId: string): string {
  const quoted = `"${payload.text}"`;
  if (listenerId === payload.speakerId) {
    return `You say, ${quoted}`;
  }
  return `${payload.speakerName} says, ${quoted}`;
}
