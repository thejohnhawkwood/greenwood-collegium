import {
  authAcceptInviteRequestSchema,
  authBootstrapRequestSchema,
  authCharacterCreateRequestSchema,
  authCharacterOptionsSchema,
  authClassroomSchema,
  authCreateInviteRequestSchema,
  authDisableAccountRequestSchema,
  authSessionPublicSchema,
  authSocketTicketSchema,
  authSignInRequestSchema,
  authStatusSchema,
  authSuggestedNameSchema,
} from "@greenwood/contracts";
import { formatCharacterName } from "@greenwood/content";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { RateLimiter } from "../application/rate-limit.js";
import type { AuthFailure, AuthService, SignedIn } from "../auth/service.js";
import { SESSION_TTL_MS } from "../auth/service.js";
import {
  expiredSessionCookie,
  parseCookie,
  SESSION_COOKIE,
  sessionCookie,
} from "../auth/cookies.js";

export const AUTH_RATE_MAX = 5;
export const AUTH_RATE_WINDOW_MS = 10_000;

export type AuthHttpDependencies = {
  auth: AuthService;
  allowGuestPlay: boolean;
  secureCookies: boolean;
  persistence?: "memory" | "postgres";
};

const failureStatus: Record<AuthFailure["code"], number> = {
  invalid_bootstrap: 401,
  owner_exists: 409,
  invalid_credentials: 401,
  account_disabled: 403,
  invalid_invite: 400,
  duplicate_username: 409,
  forbidden: 403,
  unauthenticated: 401,
  invalid_username: 400,
  weak_password: 400,
  invalid_character_name: 400,
  duplicate_character_name: 409,
  invalid_species: 400,
  invalid_gender: 400,
  character_exists: 409,
  character_incomplete: 409,
};

export async function registerAuthRoutes(
  app: FastifyInstance,
  deps: AuthHttpDependencies,
): Promise<void> {
  const limiter = new RateLimiter();

  app.get("/auth/status", async (request) => {
    const session = await sessionFromRequest(deps.auth, request);
    return authStatusSchema.parse({
      signedIn: session !== undefined,
      allowGuestPlay: deps.allowGuestPlay,
      bootstrapOpen: session ? false : await deps.auth.bootstrapOpen(),
    });
  });

  app.get("/auth/classroom", async (request, reply) => {
    const session = await sessionFromRequest(deps.auth, request);
    if (!session) {
      return reply.status(401).send({ error: "unauthenticated", message: "Sign in to continue." });
    }
    const result = await deps.auth.listClassroom(session.account.id);
    if (!result.ok) {
      return reply.status(failureStatus[result.code]).send({
        error: result.code,
        message: result.message,
      });
    }
    return authClassroomSchema.parse({
      persistence: deps.persistence ?? "memory",
      invites: result.invites.map((invite) => ({
        id: invite.id,
        role: invite.role,
        status: invite.status,
        createdAt: invite.createdAt.toISOString(),
        expiresAt: invite.expiresAt.toISOString(),
        token: invite.token,
        username: invite.username,
        characterName: invite.characterName,
      })),
      accounts: result.accounts.map((account) => ({
        accountId: account.accountId,
        username: account.username,
        role: account.role,
        status: account.status,
        createdAt: account.createdAt.toISOString(),
        characterName: account.characterName,
      })),
    });
  });

  app.get("/auth/socket-ticket", async (request, reply) => {
    const session = await sessionFromRequest(deps.auth, request);
    if (!session) {
      return reply.status(401).send({ error: "unauthenticated", message: "Sign in to continue." });
    }
    const ticket = await deps.auth.issueSocketTicket(session.account.id);
    if (!ticket) {
      return reply.status(401).send({ error: "unauthenticated", message: "Sign in to continue." });
    }
    return authSocketTicketSchema.parse({ ticket });
  });

  app.get("/auth/me", async (request, reply) => {
    const session = await sessionFromRequest(deps.auth, request);
    if (!session) {
      return reply.status(401).send({ error: "unauthenticated", message: "Sign in to continue." });
    }
    return publicSession(session);
  });

  app.get("/auth/character-options", async (request, reply) => {
    const session = await sessionFromRequest(deps.auth, request);
    if (!session) {
      return reply.status(401).send({ error: "unauthenticated", message: "Sign in to continue." });
    }
    return authCharacterOptionsSchema.parse(deps.auth.characterOptions());
  });

  app.post("/auth/suggested-name", async (request, reply) => {
    if (!rateOk(limiter, request)) {
      return rateLimited(reply);
    }
    const session = await sessionFromRequest(deps.auth, request);
    if (!session) {
      return reply.status(401).send({ error: "unauthenticated", message: "Sign in to continue." });
    }
    const name = await deps.auth.suggestCharacterName();
    if (!name) {
      return reply.status(409).send({
        error: "duplicate_character_name",
        message: "Type a name of your own. The suggested list is empty.",
      });
    }
    return authSuggestedNameSchema.parse({ name });
  });

  app.post("/auth/character", async (request, reply) => {
    if (!rateOk(limiter, request)) {
      return rateLimited(reply);
    }
    const session = await sessionFromRequest(deps.auth, request);
    if (!session) {
      return reply.status(401).send({ error: "unauthenticated", message: "Sign in to continue." });
    }
    const parsed = authCharacterCreateRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return invalidBody(reply);
    }
    const result = await deps.auth.completeCharacter(session.account.id, parsed.data);
    if (!result.ok) {
      return reply.status(failureStatus[result.code]).send({
        error: result.code,
        message: result.message,
      });
    }
    return publicSession({ account: session.account, character: result.character });
  });

  app.post("/auth/bootstrap", async (request, reply) => {
    if (!rateOk(limiter, request)) {
      return rateLimited(reply);
    }
    const parsed = authBootstrapRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return invalidBody(reply);
    }
    const result = await deps.auth.bootstrap(parsed.data);
    return finishAuth(app, deps, reply, result, "bootstrap");
  });

  app.post("/auth/sign-in", async (request, reply) => {
    if (!rateOk(limiter, request)) {
      return rateLimited(reply);
    }
    const parsed = authSignInRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return invalidBody(reply);
    }
    const result = await deps.auth.signIn(parsed.data);
    return finishAuth(app, deps, reply, result, "sign_in");
  });

  app.post("/auth/sign-out", async (request, reply) => {
    const token = parseCookie(request.headers.cookie, SESSION_COOKIE);
    if (token) {
      await deps.auth.signOut(token);
    }
    app.log.info({ action: "sign_out" }, "account signed out");
    reply.header("Set-Cookie", expiredSessionCookie(deps.secureCookies));
    return { ok: true as const };
  });

  app.post("/auth/invites", async (request, reply) => {
    const actor = await sessionFromRequest(deps.auth, request);
    if (!actor) {
      return reply.status(401).send({ error: "unauthenticated", message: "Sign in to continue." });
    }
    const parsed = authCreateInviteRequestSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return invalidBody(reply);
    }
    const result = await deps.auth.createInvite(
      actor.account.id,
      parsed.data.role,
      parsed.data.count,
    );
    if (!result.ok) {
      return reply.status(failureStatus[result.code]).send({
        error: result.code,
        message: result.message,
      });
    }
    app.log.info(
      {
        action: "invite_created",
        accountId: actor.account.id,
        username: actor.account.username,
        count: result.tokens.length,
      },
      "invite created",
    );
    return {
      token: result.token,
      tokens: result.tokens,
      role: result.role,
      expiresAt: result.expiresAt.toISOString(),
    };
  });

  app.post("/auth/accept-invite", async (request, reply) => {
    if (!rateOk(limiter, request)) {
      return rateLimited(reply);
    }
    const parsed = authAcceptInviteRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return invalidBody(reply);
    }
    const result = await deps.auth.acceptInvite(parsed.data);
    return finishAuth(app, deps, reply, result, "accept_invite");
  });

  app.post("/auth/disable", async (request, reply) => {
    const actor = await sessionFromRequest(deps.auth, request);
    if (!actor) {
      return reply.status(401).send({ error: "unauthenticated", message: "Sign in to continue." });
    }
    const parsed = authDisableAccountRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return invalidBody(reply);
    }
    const result = parsed.data.username
      ? await deps.auth.disableAccountByUsername(actor.account.id, parsed.data.username)
      : await deps.auth.disableAccount(actor.account.id, parsed.data.accountId ?? "");
    if (!result.ok) {
      return reply.status(failureStatus[result.code]).send({
        error: result.code,
        message: result.message,
      });
    }
    app.log.info(
      {
        action: "account_disabled",
        accountId: actor.account.id,
        username: actor.account.username,
        targetUsername: parsed.data.username,
      },
      "account disabled",
    );
    return { ok: true as const };
  });
}

async function sessionFromRequest(auth: AuthService, request: FastifyRequest) {
  const token = parseCookie(request.headers.cookie, SESSION_COOKIE);
  if (!token) {
    return undefined;
  }
  return auth.resolveSession(token);
}

function finishAuth(
  app: FastifyInstance,
  deps: AuthHttpDependencies,
  reply: FastifyReply,
  result: SignedIn | AuthFailure,
  action: string,
) {
  if (!result.ok) {
    return reply.status(failureStatus[result.code]).send({
      error: result.code,
      message: result.message,
    });
  }
  app.log.info(
    { action, accountId: result.account.id, username: result.account.username },
    "account authenticated",
  );
  reply.header(
    "Set-Cookie",
    sessionCookie(result.sessionToken, {
      secure: deps.secureCookies,
      maxAgeSec: SESSION_TTL_MS / 1000,
    }),
  );
  return publicSession(result);
}

function publicSession(session: {
  account: SignedIn["account"];
  character?: SignedIn["character"];
}) {
  const complete =
    session.character?.creationCompletedAt !== undefined && session.character.gender !== undefined;
  return authSessionPublicSchema.parse({
    accountId: session.account.id,
    username: session.account.username,
    role: session.account.role,
    characterComplete: complete,
    characterId: complete ? session.character?.id : undefined,
    characterName:
      complete && session.character
        ? formatCharacterName(session.character.name, session.character.speciesId)
        : undefined,
  });
}

function rateOk(limiter: RateLimiter, request: FastifyRequest): boolean {
  return limiter.allow(`auth:${request.ip}`, AUTH_RATE_MAX, AUTH_RATE_WINDOW_MS);
}

function rateLimited(reply: FastifyReply) {
  return reply.status(429).send({
    error: "rate_limited",
    message: "Please wait a moment before trying again.",
  });
}

function invalidBody(reply: FastifyReply) {
  return reply.status(400).send({
    error: "invalid_body",
    message: "That request was not valid.",
  });
}
