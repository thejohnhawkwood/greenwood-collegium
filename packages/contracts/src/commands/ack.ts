import { z } from "zod";

export const commandAckSchema = z.object({
  commandId: z.string().min(1),
  status: z.enum(["accepted", "rejected"]),
  errorCode: z.string().min(1).optional(),
  message: z.string().min(1),
  eventSequenceStart: z.number().int().nonnegative().optional(),
  eventSequenceEnd: z.number().int().nonnegative().optional(),
  resyncRequired: z.boolean(),
});

export type CommandAck = z.infer<typeof commandAckSchema>;
