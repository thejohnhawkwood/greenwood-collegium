import { z } from "zod";

export const nameReviewSchema = z.object({
  status: z.enum(["unsubmitted", "pending", "approved", "rejected"]),
  revision: z.string().optional(),
  reason: z.string().optional(),
});
export type NameReview = z.infer<typeof nameReviewSchema>;
export const moderationNoticeSchema = z.object({
  message: z.string().min(1).max(2000),
  refreshSession: z.boolean().default(false),
});
export const auditPageSchema = z.object({
  records: z.array(
    z.object({
      id: z.string(),
      at: z.string().datetime(),
      actorUsername: z.string(),
      action: z.string(),
      targetName: z.string().optional(),
      detail: z.string(),
    }),
  ),
});

const target = z.string().min(1).max(80);
const reason = z.string().trim().max(300).default("");
export const moderationActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
    accountId: target,
    revision: z.string().min(1).max(80),
  }),
  z.object({
    action: z.literal("reject"),
    accountId: target,
    revision: z.string().min(1).max(80),
    reason: z.string().trim().min(1).max(300),
  }),
  z.object({
    action: z.enum(["mute", "timeout"]),
    accountId: target,
    minutes: z.number().int().min(1).max(10_080),
    reason,
  }),
  z.object({
    action: z.enum(["unmute", "end-timeout", "disable", "restore", "remove-character", "kick"]),
    accountId: target,
    reason,
  }),
  z.object({
    action: z.literal("rename-character"),
    accountId: target,
    name: z
      .string()
      .trim()
      .min(2)
      .max(24)
      .regex(/^[A-Za-z][A-Za-z '-]*$/)
      .refine((value) => !value.includes(" the "), {
        message: "Enter a given name. The Collegium will add the species.",
      }),
    reason,
  }),
  z.object({ action: z.literal("chat-pause"), paused: z.boolean(), reason }),
]);
export type ModerationAction = z.infer<typeof moderationActionSchema>;

export const speechRecordSchema = z.object({
  id: z.number().int().positive(),
  occurredAt: z.string().datetime(),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  accountId: z.string(),
  characterId: z.string(),
  username: z.string(),
  characterName: z.string(),
  inviteReference: z.string().optional(),
  roomId: z.string(),
  text: z.string(),
});
export type SpeechRecord = z.infer<typeof speechRecordSchema>;
export const speechQuerySchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  after: z.coerce.number().int().nonnegative().default(0),
  accountId: target.optional(),
  roomId: z.string().min(1).max(80).optional(),
});
export const speechPageSchema = z.object({
  records: z.array(speechRecordSchema),
  hasMore: z.boolean(),
});
export const speechDaysSchema = z.object({
  days: z.array(z.string()),
  timeZone: z.literal("America/Edmonton"),
  retentionMonths: z.literal(6),
});
export const resetPreviewSchema = z.object({
  revision: z.string(),
  accounts: z.number().int(),
  characters: z.number().int(),
  invites: z.number().int(),
});
export const resetRequestSchema = z.object({
  revision: z.string().min(1).max(80),
  confirmation: z.literal("RESET STUDENTS"),
});
