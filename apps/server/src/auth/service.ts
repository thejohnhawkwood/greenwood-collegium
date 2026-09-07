import {
  DuplicateUsernameError,
  normalizeUsername,
  type AccountRecord,
  type AccountRepository,
  type CharacterRecord,
  type CharacterRepository,
  type InviteRepository,
  type InviteRole,
  type SessionRepository,
} from "../persistence/types.js";
import type { PasswordHasher } from "./hasher.js";
import { hashToken, randomToken, tokensEqual } from "./tokens.js";

export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const SOCKET_TICKET_TTL_MS = 2 * 60 * 1000;
export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const DEFAULT_START_ROOM_ID = "lantern-court";
export const DEFAULT_SPECIES_ID = "hare";

const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_-]{2,31}$/;

export type AuthFailureCode =
  | "invalid_bootstrap"
  | "owner_exists"
  | "invalid_credentials"
  | "account_disabled"
  | "invalid_invite"
  | "duplicate_username"
  | "forbidden"
  | "unauthenticated"
  | "invalid_username"
  | "weak_password";

export type AuthFailure = {
  ok: false;
  code: AuthFailureCode;
  message: string;
};

export type SignedIn = {
  ok: true;
  account: AccountRecord;
  character: CharacterRecord;
  sessionToken: string;
};

export type ClassroomInvite = {
  id: string;
  role: InviteRole;
  status: "unused" | "used" | "expired";
  createdAt: Date;
  expiresAt: Date;
  token?: string;
  username?: string;
};

export type ClassroomAccount = {
  username: string;
  role: Exclude<AccountRecord["role"], "owner">;
  createdAt: Date;
};

export type PlayIdentity = {
  accountId: string;
  characterId: string;
  characterName: string;
  roomId: string;
  experience: number;
  level: number;
};

export type AuthService = {
  bootstrapOpen(): Promise<boolean>;
  bootstrap(input: {
    token: string;
    username: string;
    password: string;
  }): Promise<SignedIn | AuthFailure>;
  signIn(input: {
    username: string;
    password: string;
    audience?: "student" | "staff";
  }): Promise<SignedIn | AuthFailure>;
  listClassroom(actorId: string): Promise<
    | {
        ok: true;
        invites: ClassroomInvite[];
        accounts: ClassroomAccount[];
      }
    | AuthFailure
  >;
  signOut(sessionToken: string): Promise<void>;
  createInvite(
    actorId: string,
    role: InviteRole,
  ): Promise<{ ok: true; token: string; role: InviteRole; expiresAt: Date } | AuthFailure>;
  acceptInvite(input: {
    token: string;
    username: string;
    password: string;
  }): Promise<SignedIn | AuthFailure>;
  disableAccount(actorId: string, targetId: string): Promise<{ ok: true } | AuthFailure>;
  resolveSession(
    sessionToken: string,
  ): Promise<{ account: AccountRecord; character: CharacterRecord } | undefined>;
  resolvePlayIdentity(sessionToken: string): Promise<PlayIdentity | undefined>;
  issueSocketTicket(accountId: string): Promise<string | undefined>;
  resolveSocketTicket(ticket: string): Promise<PlayIdentity | undefined>;
};

export type AuthServiceDeps = {
  accounts: AccountRepository;
  characters: CharacterRepository;
  sessions: SessionRepository;
  invites: InviteRepository;
  hasher: PasswordHasher;
  bootstrapToken: string | undefined;
  now?: () => Date;
  startRoomId?: string;
};

export function createAuthService(deps: AuthServiceDeps): AuthService {
  const now = deps.now ?? (() => new Date());
  const startRoomId = deps.startRoomId ?? DEFAULT_START_ROOM_ID;
  const socketTickets = new Map<string, { accountId: string; expiresAt: number }>();

  async function bootstrapOpen(): Promise<boolean> {
    const owners = await deps.accounts.listByRole("owner");
    return owners.length === 0;
  }

  async function bootstrap(input: {
    token: string;
    username: string;
    password: string;
  }): Promise<SignedIn | AuthFailure> {
    const expected = deps.bootstrapToken?.trim();
    const provided = input.token.trim();
    if (!expected || !tokensEqual(provided, expected)) {
      return fail("invalid_bootstrap", "That bootstrap token is not valid.");
    }
    if (!(await bootstrapOpen())) {
      return fail("owner_exists", "An owner account already exists.");
    }
    const created = await createAccountWithCharacter({
      username: input.username,
      password: input.password,
      role: "owner",
    });
    if (!created.ok) {
      return created;
    }
    return issueSession(created.account, created.character);
  }

  async function signIn(input: {
    username: string;
    password: string;
    audience?: "student" | "staff";
  }): Promise<SignedIn | AuthFailure> {
    const account = await deps.accounts.getByUsername(input.username);
    if (!account) {
      return fail("invalid_credentials", "That username or password is not correct.");
    }
    const matches = await deps.hasher.verify(account.passwordHash, input.password);
    if (!matches) {
      return fail("invalid_credentials", "That username or password is not correct.");
    }
    if (input.audience === "student" && account.role !== "student") {
      return fail("invalid_credentials", "Use the teacher sign-in below.");
    }
    if (input.audience === "staff" && account.role === "student") {
      return fail("invalid_credentials", "Use the student sign-in above.");
    }
    if (account.status === "disabled") {
      return fail("account_disabled", "That account is disabled.");
    }
    const character = await requireCharacter(account.id);
    if (!character) {
      return fail("invalid_credentials", "That username or password is not correct.");
    }
    await deps.accounts.touchSignIn(account.id, now());
    return issueSession(account, character);
  }

  async function signOut(sessionToken: string): Promise<void> {
    const session = await deps.sessions.getByTokenHash(hashToken(sessionToken));
    if (session && !session.revokedAt) {
      await deps.sessions.revoke(session.id, now());
    }
  }

  async function createInvite(
    actorId: string,
    role: InviteRole,
  ): Promise<{ ok: true; token: string; role: InviteRole; expiresAt: Date } | AuthFailure> {
    const actor = await deps.accounts.getById(actorId);
    if (!actor || actor.status !== "active") {
      return fail("unauthenticated", "Sign in to continue.");
    }
    if (actor.role === "student") {
      return fail("forbidden", "Students cannot issue invites.");
    }
    if (role === "teacher" && actor.role !== "owner") {
      return fail("forbidden", "Only the owner can invite a teacher.");
    }
    const token = randomToken();
    const expiresAt = new Date(now().getTime() + INVITE_TTL_MS);
    await deps.invites.create({
      tokenHash: hashToken(token),
      role,
      createdByAccountId: actor.id,
      expiresAt,
      issuedToken: token,
    });
    return { ok: true, token, role, expiresAt };
  }

  async function acceptInvite(input: {
    token: string;
    username: string;
    password: string;
  }): Promise<SignedIn | AuthFailure> {
    const invite = await deps.invites.getByTokenHash(hashToken(input.token.trim()));
    if (!invite || invite.consumedAt || invite.expiresAt.getTime() <= now().getTime()) {
      return fail("invalid_invite", "That invite is not valid.");
    }
    const created = await createAccountWithCharacter({
      username: input.username,
      password: input.password,
      role: invite.role,
    });
    if (!created.ok) {
      return created;
    }
    const consumed = await deps.invites.consume(invite.id, now(), created.account.id);
    if (!consumed) {
      return fail("invalid_invite", "That invite is not valid.");
    }
    return issueSession(created.account, created.character);
  }

  async function listClassroom(actorId: string): Promise<
    | {
        ok: true;
        invites: ClassroomInvite[];
        accounts: ClassroomAccount[];
      }
    | AuthFailure
  > {
    const actor = await deps.accounts.getById(actorId);
    if (!actor || actor.status !== "active") {
      return fail("unauthenticated", "Sign in to continue.");
    }
    if (actor.role === "student") {
      return fail("forbidden", "Students cannot read the classroom roster.");
    }
    const [invites, students, teachers] = await Promise.all([
      deps.invites.list(),
      deps.accounts.listByRole("student"),
      deps.accounts.listByRole("teacher"),
    ]);
    const usernames = new Map<string, string>();
    for (const account of [...students, ...teachers]) {
      usernames.set(account.id, account.username);
    }
    return {
      ok: true,
      invites: invites.map((invite) => {
        const expired = invite.expiresAt.getTime() <= now().getTime();
        const status = invite.consumedAt ? "used" : expired ? "expired" : "unused";
        return {
          id: invite.id,
          role: invite.role,
          status,
          createdAt: invite.createdAt,
          expiresAt: invite.expiresAt,
          token: status === "unused" ? invite.issuedToken : undefined,
          username: invite.consumedByAccountId
            ? usernames.get(invite.consumedByAccountId)
            : undefined,
        };
      }),
      accounts: [...students, ...teachers]
        .sort((left, right) => left.username.localeCompare(right.username))
        .map((account) => ({
          username: account.username,
          role: account.role === "teacher" ? ("teacher" as const) : ("student" as const),
          createdAt: account.createdAt,
        })),
    };
  }

  async function disableAccount(
    actorId: string,
    targetId: string,
  ): Promise<{ ok: true } | AuthFailure> {
    const actor = await deps.accounts.getById(actorId);
    if (!actor || actor.status !== "active") {
      return fail("unauthenticated", "Sign in to continue.");
    }
    const target = await deps.accounts.getById(targetId);
    if (!target) {
      return fail("forbidden", "That account was not found.");
    }
    if (target.role === "owner") {
      return fail("forbidden", "The owner account cannot be disabled this way.");
    }
    if (actor.role === "student") {
      return fail("forbidden", "Students cannot disable accounts.");
    }
    if (actor.role === "teacher" && target.role !== "student") {
      return fail("forbidden", "Teachers can only disable student accounts.");
    }
    await deps.accounts.updateStatus(target.id, "disabled");
    await deps.sessions.revokeAllForAccount(target.id, now());
    return { ok: true };
  }

  async function resolveSession(
    sessionToken: string,
  ): Promise<{ account: AccountRecord; character: CharacterRecord } | undefined> {
    const session = await deps.sessions.getByTokenHash(hashToken(sessionToken));
    if (!session || session.revokedAt || session.expiresAt.getTime() <= now().getTime()) {
      return undefined;
    }
    const account = await deps.accounts.getById(session.accountId);
    if (!account || account.status !== "active") {
      return undefined;
    }
    const character = await requireCharacter(account.id);
    if (!character) {
      return undefined;
    }
    return { account, character };
  }

  async function resolvePlayIdentity(sessionToken: string): Promise<PlayIdentity | undefined> {
    const resolved = await resolveSession(sessionToken);
    if (!resolved) {
      return undefined;
    }
    return playIdentity(resolved.account, resolved.character);
  }

  async function playIdentityForAccount(accountId: string): Promise<PlayIdentity | undefined> {
    const account = await deps.accounts.getById(accountId);
    if (!account || account.status !== "active") {
      return undefined;
    }
    const character = await requireCharacter(account.id);
    if (!character) {
      return undefined;
    }
    return playIdentity(account, character);
  }

  async function issueSocketTicket(accountId: string): Promise<string | undefined> {
    if (!(await playIdentityForAccount(accountId))) {
      return undefined;
    }
    const ticket = randomToken();
    socketTickets.set(hashToken(ticket), {
      accountId,
      expiresAt: now().getTime() + SOCKET_TICKET_TTL_MS,
    });
    return ticket;
  }

  async function resolveSocketTicket(ticket: string): Promise<PlayIdentity | undefined> {
    const trimmed = ticket.trim();
    if (!trimmed) {
      return undefined;
    }
    const hash = hashToken(trimmed);
    const row = socketTickets.get(hash);
    if (!row || row.expiresAt <= now().getTime()) {
      socketTickets.delete(hash);
      return undefined;
    }
    return playIdentityForAccount(row.accountId);
  }

  async function createAccountWithCharacter(input: {
    username: string;
    password: string;
    role: AccountRecord["role"];
  }): Promise<{ ok: true; account: AccountRecord; character: CharacterRecord } | AuthFailure> {
    const username = normalizeUsername(input.username);
    if (!USERNAME_PATTERN.test(username)) {
      return fail("invalid_username", "Usernames use letters, numbers, underscores, or hyphens.");
    }
    if (input.password.length < 10 || input.password.length > 128) {
      return fail("weak_password", "Passwords must be between 10 and 128 characters.");
    }
    try {
      const account = await deps.accounts.create({
        username,
        passwordHash: await deps.hasher.hash(input.password),
        role: input.role,
      });
      const character = await deps.characters.create({
        accountId: account.id,
        name: displayName(username),
        speciesId: DEFAULT_SPECIES_ID,
        roomId: startRoomId,
      });
      return { ok: true, account, character };
    } catch (error) {
      if (error instanceof DuplicateUsernameError) {
        return fail("duplicate_username", "That username is already taken.");
      }
      throw error;
    }
  }

  async function issueSession(
    account: AccountRecord,
    character: CharacterRecord,
  ): Promise<SignedIn> {
    const sessionToken = randomToken();
    await deps.sessions.create({
      accountId: account.id,
      tokenHash: hashToken(sessionToken),
      expiresAt: new Date(now().getTime() + SESSION_TTL_MS),
    });
    return { ok: true, account, character, sessionToken };
  }

  async function requireCharacter(accountId: string): Promise<CharacterRecord | undefined> {
    const [character] = await deps.characters.listByAccountId(accountId);
    if (!character || character.status !== "active") {
      return undefined;
    }
    return character;
  }

  return {
    bootstrapOpen,
    bootstrap,
    signIn,
    signOut,
    createInvite,
    acceptInvite,
    listClassroom,
    disableAccount,
    resolveSession,
    resolvePlayIdentity,
    issueSocketTicket,
    resolveSocketTicket,
  };
}

function playIdentity(account: AccountRecord, character: CharacterRecord): PlayIdentity {
  return {
    accountId: account.id,
    characterId: character.id,
    characterName: character.name,
    roomId: character.roomId,
    experience: character.experience,
    level: character.level,
  };
}

function displayName(username: string): string {
  return username.charAt(0).toUpperCase() + username.slice(1);
}

function fail(code: AuthFailureCode, message: string): AuthFailure {
  return { ok: false, code, message };
}
