import { z } from "zod";

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

export const authCreateInviteRequestSchema = z.object({
  role: z.enum(["student", "teacher"]).default("student"),
});

export const authDisableAccountRequestSchema = z.object({
  accountId: z.string().min(1).max(80),
});

export const authStatusSchema = z.object({
  signedIn: z.boolean(),
  allowGuestPlay: z.boolean(),
  bootstrapOpen: z.boolean(),
});

export const authSessionPublicSchema = z.object({
  accountId: z.string(),
  username: z.string(),
  role: accountRoleSchema,
  characterId: z.string(),
  characterName: z.string(),
});

export const authInviteCreatedSchema = z.object({
  token: z.string(),
  role: z.enum(["student", "teacher"]),
  expiresAt: z.string(),
});

export const authErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

export const authClassroomInviteSchema = z.object({
  id: z.string(),
  role: z.enum(["student", "teacher"]),
  status: z.enum(["unused", "used", "expired"]),
  createdAt: z.string(),
  expiresAt: z.string(),
  token: z.string().optional(),
  username: z.string().optional(),
});

export const authClassroomAccountSchema = z.object({
  username: z.string(),
  role: z.enum(["student", "teacher"]),
  createdAt: z.string(),
});

export const authClassroomSchema = z.object({
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
export type AuthInviteCreated = z.infer<typeof authInviteCreatedSchema>;
export type AuthClassroom = z.infer<typeof authClassroomSchema>;
export type AuthClassroomInvite = z.infer<typeof authClassroomInviteSchema>;
export type AuthClassroomAccount = z.infer<typeof authClassroomAccountSchema>;
