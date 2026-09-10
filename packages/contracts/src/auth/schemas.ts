import { z } from "zod";
import { nameReviewSchema } from "./moderation.js";

export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/);

export const passwordSchema = z.string().min(10).max(128);

export const accountRoleSchema = z.enum(["owner", "teacher", "student"]);

export const authBootstrapRequestSchema = z.object({
  token: z.string().min(1).max(200),
  username: usernameSchema,
  password: passwordSchema,
});

export const authSignInAudienceSchema = z.enum(["student", "staff"]);

export const authSignInRequestSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1).max(128),
  audience: authSignInAudienceSchema.optional(),
});

export const authAcceptInviteRequestSchema = z.object({
  token: z.string().min(1).max(200),
  username: usernameSchema,
  password: passwordSchema,
});

export const STUDENT_INVITE_BATCH_MAX = 200;

export const authCreateInviteRequestSchema = z.object({
  role: z.enum(["student", "teacher"]).default("student"),
  count: z.number().int().min(1).max(STUDENT_INVITE_BATCH_MAX).default(1),
});

export const authDisableAccountRequestSchema = z
  .object({
    accountId: z.string().min(1).max(80).optional(),
    username: usernameSchema.optional(),
  })
  .refine((value) => Boolean(value.accountId || value.username), {
    message: "accountId or username is required",
  });

export const authStatusSchema = z.object({
  signedIn: z.boolean(),
  allowGuestPlay: z.boolean(),
  bootstrapOpen: z.boolean(),
});

export const authSocketTicketSchema = z.object({
  ticket: z.string().min(1).max(200),
});

export const authCharacterGenderSchema = z.enum(["female", "male"]);

export const authCharacterNameSchema = z
  .string()
  .trim()
  .min(2)
  .max(24)
  .regex(/^[A-Za-z][A-Za-z '-]*$/);

export const authCharacterCreateRequestSchema = z.object({
  username: usernameSchema.optional(),
  name: authCharacterNameSchema,
  speciesId: z.string().min(1).max(32),
  gender: authCharacterGenderSchema,
});

export const authSuggestedNameRequestSchema = z.object({
  speciesId: z.string().min(1).max(32),
  gender: authCharacterGenderSchema,
});

export const authSuggestedNameSchema = z.object({
  name: z.string().min(1),
});

export const authCharacterOptionsSchema = z.object({
  intro: z.string().min(1),
  species: z.array(z.object({ id: z.string(), name: z.string() })),
  genders: z.array(z.object({ id: authCharacterGenderSchema, label: z.string() })),
});

export const authSessionPublicSchema = z.object({
  nameReview: nameReviewSchema.optional(),
  timeoutUntil: z.string().optional(),
  accountId: z.string(),
  username: z.string(),
  role: accountRoleSchema,
  characterComplete: z.boolean(),
  characterId: z.string().optional(),
  characterName: z.string().optional(),
});

export const authInviteCreatedSchema = z.object({
  token: z.string(),
  tokens: z.array(z.string()).min(1),
  role: z.enum(["student", "teacher"]),
  expiresAt: z.string(),
});

export const authErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

export const authClassroomInviteSchema = z.object({
  accountId: z.string().optional(),
  characterId: z.string().optional(),
  id: z.string(),
  role: z.enum(["student", "teacher"]),
  status: z.enum(["unused", "used", "expired"]),
  createdAt: z.string(),
  expiresAt: z.string(),
  token: z.string().optional(),
  username: z.string().optional(),
  characterName: z.string().optional(),
});

export const authClassroomAccountSchema = z.object({
  characterId: z.string().optional(),
  inviteReference: z.string().optional(),
  nameReview: nameReviewSchema.optional(),
  mutedUntil: z.string().optional(),
  timeoutUntil: z.string().optional(),
  accountId: z.string(),
  username: z.string(),
  role: z.enum(["student", "teacher"]),
  status: z.enum(["active", "disabled"]),
  createdAt: z.string(),
  characterName: z.string().optional(),
});

export const authClassroomSchema = z.object({
  chatPaused: z.boolean().default(false),
  persistence: z.enum(["memory", "postgres"]),
  invites: z.array(authClassroomInviteSchema),
  accounts: z.array(authClassroomAccountSchema),
});

export type AuthBootstrapRequest = z.infer<typeof authBootstrapRequestSchema>;
export type AuthSignInRequest = z.infer<typeof authSignInRequestSchema>;
export type AuthAcceptInviteRequest = z.infer<typeof authAcceptInviteRequestSchema>;
export type AuthCreateInviteRequest = z.infer<typeof authCreateInviteRequestSchema>;
export type AuthDisableAccountRequest = z.infer<typeof authDisableAccountRequestSchema>;
export type AuthStatus = z.infer<typeof authStatusSchema>;
export type AuthSessionPublic = z.infer<typeof authSessionPublicSchema>;
export type AuthSocketTicket = z.infer<typeof authSocketTicketSchema>;
export type AuthCharacterCreateRequest = z.infer<typeof authCharacterCreateRequestSchema>;
export type AuthSuggestedNameRequest = z.infer<typeof authSuggestedNameRequestSchema>;
export type AuthSuggestedName = z.infer<typeof authSuggestedNameSchema>;
export type AuthCharacterOptions = z.infer<typeof authCharacterOptionsSchema>;
export type AuthCharacterGender = z.infer<typeof authCharacterGenderSchema>;
export type AuthInviteCreated = z.infer<typeof authInviteCreatedSchema>;
export type AuthClassroom = z.infer<typeof authClassroomSchema>;
export type AuthClassroomInvite = z.infer<typeof authClassroomInviteSchema>;
export type AuthClassroomAccount = z.infer<typeof authClassroomAccountSchema>;
