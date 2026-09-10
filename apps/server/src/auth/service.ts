import {
  formatCharacterName,
  isKnownGender,
  isKnownSpecies,
  listSpecies,
  reservedCharacterNames,
  suggestedCharacterNames,
  characterCreationIntro,
  CHARACTER_GENDERS,
} from "@greenwood/content";
import {
  DuplicateCharacterNameError,
  DuplicateUsernameError,
  normalizeCharacterName,
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
import { STUDENT_INVITE_BATCH_MAX, type NameReview } from "@greenwood/contracts";
import type { ModerationRepository, ModerationState } from "../persistence/moderation-types.js";
import { nameReview } from "../application/name-review.js";
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
  | "weak_password"
  | "invalid_character_name"
  | "duplicate_character_name"
  | "invalid_species"
  | "invalid_gender"
  | "character_exists"
  | "character_incomplete";

export type AuthFailure = {
  ok: false;
  code: AuthFailureCode;
  message: string;
};

export type SignedIn = {
  ok: true;
  account: AccountRecord;
  character?: CharacterRecord;
  sessionToken: string;
};

export type ClassroomInvite = {
  accountId?: string;
  characterId?: string;
  id: string;
  role: InviteRole;
  status: "unused" | "used" | "expired";
  createdAt: Date;
  expiresAt: Date;
  token?: string;
  username?: string;
  characterName?: string;
};

export type ClassroomAccount = {
  characterId?: string;
  inviteReference?: string;
  nameReview?: NameReview;
  mutedUntil?: string;
  timeoutUntil?: string;
  accountId: string;
  username: string;
  role: Exclude<AccountRecord["role"], "owner">;
  status: AccountRecord["status"];
  createdAt: Date;
  characterName?: string;
};

export type PlayIdentity = {
  accountId: string;
  characterId: string;
  characterName: string;
  username: string;
  role: AccountRecord["role"];
  speciesId: string;
  gender?: CharacterRecord["gender"];
  roomId: string;
  experience: number;
  level: number;
};

export type AuthService = {
  reviewStatus(accountId: string): Promise<NameReview>;
  moderationState(accountId: string): Promise<ModerationState>;
  recheckPlayIdentity(accountId: string): Promise<PlayIdentity | undefined>;
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
    count?: number,
  ): Promise<
    { ok: true; token: string; tokens: string[]; role: InviteRole; expiresAt: Date } | AuthFailure
  >;
  acceptInvite(input: {
    token: string;
    username: string;
    password: string;
  }): Promise<SignedIn | AuthFailure>;
  disableAccount(actorId: string, targetId: string): Promise<{ ok: true } | AuthFailure>;
  disableAccountByUsername(actorId: string, username: string): Promise<{ ok: true } | AuthFailure>;
  resolveSession(
    sessionToken: string,
  ): Promise<{ account: AccountRecord; character?: CharacterRecord } | undefined>;
  resolvePlayIdentity(sessionToken: string): Promise<PlayIdentity | undefined>;
  issueSocketTicket(accountId: string): Promise<string | undefined>;
  resolveSocketTicket(ticket: string): Promise<PlayIdentity | undefined>;
  characterOptions(): {
    intro: string;
    species: ReadonlyArray<{ id: string; name: string }>;
    genders: ReadonlyArray<{ id: string; label: string }>;
  };
  suggestCharacterName(): Promise<string | undefined>;
  completeCharacter(
    accountId: string,
    input: {
      username?: string;
      name: string;
      speciesId: string;
      gender: NonNullable<CharacterRecord["gender"]>;
    },
  ): Promise<{ ok: true; character: CharacterRecord } | AuthFailure>;
};

export type AuthServiceDeps = {
  moderation: ModerationRepository;
  accounts: AccountRepository;
  characters: CharacterRepository;
  sessions: SessionRepository;
  invites: InviteRepository;
  hasher: PasswordHasher;
  bootstrapToken: string | undefined;
  now?: () => Date;
  startRoomId?: string;
  random?: () => number;
};

export function createAuthService(deps: AuthServiceDeps): AuthService {
  const now = deps.now ?? (() => new Date());
  const random = deps.random ?? Math.random;
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
    const created = await createAccount({
      username: input.username,
      password: input.password,
      role: "owner",
    });
    if (!created.ok) {
      return created;
    }
    return issueSession(created.account);
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
    await deps.accounts.touchSignIn(account.id, now());
    return issueSession(account, await findCharacter(account.id));
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
    count = 1,
  ): Promise<
    { ok: true; token: string; tokens: string[]; role: InviteRole; expiresAt: Date } | AuthFailure
  > {
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
    if (role === "teacher" && count !== 1) {
      return fail("forbidden", "Issue teacher invites one at a time.");
    }
    if (!Number.isInteger(count) || count < 1 || count > STUDENT_INVITE_BATCH_MAX) {
      return fail(
        "invalid_invite",
        `Choose between 1 and ${String(STUDENT_INVITE_BATCH_MAX)} student invites.`,
      );
    }
    const tokens: string[] = [];
    const expiresAt = new Date(now().getTime() + INVITE_TTL_MS);
    for (let index = 0; index < count; index += 1) {
      const token = randomToken();
      await deps.invites.create({
        tokenHash: hashToken(token),
        role,
        createdByAccountId: actor.id,
        expiresAt,
        issuedToken: token,
      });
      tokens.push(token);
    }
    const token = tokens[0];
    if (!token) {
      return fail(
        "invalid_invite",
        `Choose between 1 and ${String(STUDENT_INVITE_BATCH_MAX)} student invites.`,
      );
    }
    return { ok: true, token, tokens, role, expiresAt };
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
    const created = await createAccount({
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
    return issueSession(created.account);
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
    const listed = [...students, ...teachers].sort((left, right) =>
      left.username.localeCompare(right.username),
    );
    const names = new Map<string, string>();
    const characterIds = new Map<string, string>();
    const states = new Map<string, ModerationState>();
    const reviews = new Map<string, NameReview>();
    const usernames = new Map<string, string>();
    for (const account of listed) {
      usernames.set(account.id, account.username);
      const [character] = await deps.characters.listByAccountId(account.id);
      const state = await deps.moderation.get(account.id);
      states.set(account.id, state);
      reviews.set(account.id, nameReview(account, character, state));
      if (character) characterIds.set(account.id, character.id);
      if (character && isCharacterComplete(character)) {
        names.set(account.id, formatCharacterName(character.name, character.speciesId));
      }
    }
    return {
      ok: true,
      invites: invites.map((invite) => {
        const expired = invite.expiresAt.getTime() <= now().getTime();
        const status = invite.consumedAt ? "used" : expired ? "expired" : "unused";
        return {
          id: invite.id,
          accountId: invite.consumedByAccountId,
          characterId: invite.consumedByAccountId
            ? characterIds.get(invite.consumedByAccountId)
            : undefined,
          role: invite.role,
          status,
          createdAt: invite.createdAt,
          expiresAt: invite.expiresAt,
          token: status === "unused" ? invite.issuedToken : undefined,
          username: invite.consumedByAccountId
            ? usernames.get(invite.consumedByAccountId)
            : undefined,
          characterName: invite.consumedByAccountId
            ? names.get(invite.consumedByAccountId)
            : undefined,
        };
      }),
      accounts: listed.map((account) => ({
        accountId: account.id,
        username: account.username,
        characterId: characterIds.get(account.id),
        inviteReference: invites.find((invite) => invite.consumedByAccountId === account.id)?.id,
        nameReview: reviews.get(account.id),
        mutedUntil: states.get(account.id)?.mutedUntil,
        timeoutUntil: states.get(account.id)?.timeoutUntil,
        role: account.role === "teacher" ? ("teacher" as const) : ("student" as const),
        status: account.status,
        createdAt: account.createdAt,
        characterName: names.get(account.id),
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

  async function disableAccountByUsername(
    actorId: string,
    username: string,
  ): Promise<{ ok: true } | AuthFailure> {
    const target = await deps.accounts.getByUsername(username);
    if (!target) {
      return fail("forbidden", "That account was not found.");
    }
    return disableAccount(actorId, target.id);
  }

  async function resolveSession(
    sessionToken: string,
  ): Promise<{ account: AccountRecord; character?: CharacterRecord } | undefined> {
    const session = await deps.sessions.getByTokenHash(hashToken(sessionToken));
    if (!session || session.revokedAt || session.expiresAt.getTime() <= now().getTime()) {
      return undefined;
    }
    const account = await deps.accounts.getById(session.accountId);
    if (!account || account.status !== "active") {
      return undefined;
    }
    return { account, character: await findCharacter(account.id) };
  }

  async function resolvePlayIdentity(sessionToken: string): Promise<PlayIdentity | undefined> {
    const resolved = await resolveSession(sessionToken);
    if (!resolved?.character || !isCharacterComplete(resolved.character)) {
      return undefined;
    }
    return playIdentityForAccount(resolved.account.id);
  }

  async function playIdentityForAccount(accountId: string): Promise<PlayIdentity | undefined> {
    const account = await deps.accounts.getById(accountId);
    if (!account || account.status !== "active") {
      return undefined;
    }
    const character = await findCharacter(account.id);
    if (!character || !isCharacterComplete(character)) {
      return undefined;
    }
    const state = await deps.moderation.get(accountId);
    if (
      nameReview(account, character, state).status !== "approved" ||
      (state.timeoutUntil && Date.parse(state.timeoutUntil) > now().getTime())
    )
      return undefined;
    return playIdentity(account, character);
  }

  function characterOptions() {
    return {
      intro: characterCreationIntro(),
      species: listSpecies(),
      genders: CHARACTER_GENDERS,
    };
  }

  async function suggestCharacterName(): Promise<string | undefined> {
    const available: string[] = [];
    for (const candidate of suggestedCharacterNames()) {
      if (isReservedCharacterName(candidate)) {
        continue;
      }
      if (await deps.characters.getByNormalizedName(candidate)) {
        continue;
      }
      available.push(candidate);
    }
    if (available.length === 0) {
      return undefined;
    }
    const index = Math.floor(random() * available.length);
    return available[index];
  }

  async function completeCharacter(
    accountId: string,
    input: {
      username?: string;
      name: string;
      speciesId: string;
      gender: NonNullable<CharacterRecord["gender"]>;
    },
  ): Promise<{ ok: true; character: CharacterRecord } | AuthFailure> {
    const account = await deps.accounts.getById(accountId);
    if (!account || account.status !== "active") {
      return fail("unauthenticated", "Sign in to continue.");
    }
    if (!isKnownSpecies(input.speciesId)) {
      return fail("invalid_species", "Choose a species from the list.");
    }
    if (!input.gender || !isKnownGender(input.gender)) {
      return fail("invalid_gender", "Choose a gender from the list.");
    }
    const givenName = titleCharacterName(input.name);
    const nameCheck = validateGivenName(givenName);
    if (nameCheck) {
      return nameCheck;
    }
    const existing = await findCharacter(account.id);
    if (
      existing &&
      isCharacterComplete(existing) &&
      (account.role !== "student" ||
        nameReview(account, existing, await deps.moderation.get(accountId)).status === "approved")
    ) {
      return fail("character_exists", "This account already has a Collegian.");
    }
    const taken = await deps.characters.getByNormalizedName(givenName);
    if (taken && taken.id !== existing?.id) {
      return fail("duplicate_character_name", "That name is already taken.");
    }
    try {
      if (input.username !== undefined) {
        if (!USERNAME_PATTERN.test(normalizeUsername(input.username)))
          return fail(
            "invalid_username",
            "Use 3–32 letters, numbers, underscores, or hyphens for the login.",
          );
        await deps.accounts.rename(account.id, input.username);
      }
      const submittedAt = new Date(
        Math.max(now().getTime(), (existing?.creationCompletedAt?.getTime() ?? 0) + 1),
      );
      if (existing) {
        const character = await deps.characters.updateCreation(existing.id, {
          name: givenName,
          speciesId: input.speciesId,
          gender: input.gender,
          creationCompletedAt: submittedAt,
        });
        return { ok: true, character };
      }
      const character = await deps.characters.create({
        accountId: account.id,
        name: givenName,
        speciesId: input.speciesId,
        gender: input.gender,
        roomId: startRoomId,
        creationCompletedAt: submittedAt,
      });
      return { ok: true, character };
    } catch (error) {
      if (error instanceof DuplicateUsernameError)
        return fail("duplicate_username", "That login is already taken.");
      if (error instanceof DuplicateCharacterNameError) {
        return fail("duplicate_character_name", "That name is already taken.");
      }
      throw error;
    }
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

  async function createAccount(input: {
    username: string;
    password: string;
    role: AccountRecord["role"];
  }): Promise<{ ok: true; account: AccountRecord } | AuthFailure> {
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
      return { ok: true, account };
    } catch (error) {
      if (error instanceof DuplicateUsernameError) {
        return fail("duplicate_username", "That username is already taken.");
      }
      throw error;
    }
  }

  async function issueSession(
    account: AccountRecord,
    character?: CharacterRecord,
  ): Promise<SignedIn> {
    const sessionToken = randomToken();
    await deps.sessions.create({
      accountId: account.id,
      tokenHash: hashToken(sessionToken),
      expiresAt: new Date(now().getTime() + SESSION_TTL_MS),
    });
    return { ok: true, account, character, sessionToken };
  }

  async function findCharacter(accountId: string): Promise<CharacterRecord | undefined> {
    const [character] = await deps.characters.listByAccountId(accountId);
    if (!character || character.status !== "active") {
      return undefined;
    }
    return character;
  }

  return {
    moderationState: (accountId) => deps.moderation.get(accountId),
    recheckPlayIdentity: playIdentityForAccount,
    reviewStatus: async (accountId) => {
      const account = await deps.accounts.getById(accountId);
      return account
        ? nameReview(account, await findCharacter(accountId), await deps.moderation.get(accountId))
        : { status: "unsubmitted" };
    },
    bootstrapOpen,
    bootstrap,
    signIn,
    signOut,
    createInvite,
    acceptInvite,
    listClassroom,
    disableAccount,
    disableAccountByUsername,
    resolveSession,
    resolvePlayIdentity,
    issueSocketTicket,
    resolveSocketTicket,
    characterOptions,
    suggestCharacterName,
    completeCharacter,
  };
}

function playIdentity(account: AccountRecord, character: CharacterRecord): PlayIdentity {
  return {
    accountId: account.id,
    characterId: character.id,
    characterName: formatCharacterName(character.name, character.speciesId),
    username: account.username,
    role: account.role,
    speciesId: character.speciesId,
    gender: character.gender,
    roomId: character.roomId,
    experience: character.experience,
    level: character.level,
  };
}

function isCharacterComplete(character: CharacterRecord): boolean {
  return character.creationCompletedAt !== undefined && character.gender !== undefined;
}

function validateGivenName(name: string): AuthFailure | undefined {
  if (name.includes(" the ")) {
    return fail(
      "invalid_character_name",
      "Enter a given name. The Collegium will add your species.",
    );
  }
  if (isReservedCharacterName(name)) {
    return fail("invalid_character_name", "Choose a different name. That one is reserved.");
  }
  return undefined;
}

function isReservedCharacterName(name: string): boolean {
  const needle = normalizeCharacterName(name);
  return reservedCharacterNames().some((reserved) => normalizeCharacterName(reserved) === needle);
}

function titleCharacterName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .split(/(\s+|-|')/)
    .map((part) => {
      if (part === "'" || part === "-" || /^\s+$/.test(part)) {
        return part;
      }
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join("");
}

function fail(code: AuthFailureCode, message: string): AuthFailure {
  return { ok: false, code, message };
}
