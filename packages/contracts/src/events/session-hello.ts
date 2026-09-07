import { z } from "zod";

export const SESSION_HELLO_EVENT = "session-hello";

export const sessionHelloSchema = z.object({
  bootId: z.string().min(1),
});

export type SessionHello = z.infer<typeof sessionHelloSchema>;
