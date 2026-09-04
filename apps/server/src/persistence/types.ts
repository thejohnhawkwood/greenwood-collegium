export type AccountStatus = "active" | "disabled";
export type AccountRole = "owner" | "teacher" | "student";
export type CharacterStatus = "active" | "disabled";
export type InviteRole = "student" | "teacher";

export type AccountRecord = {
  id: string;
  username: string;
  passwordHash: string;
  status: AccountStatus;
  role: AccountRole;
  lastSignInAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CharacterRecord = {
  id: string;
  accountId: string;
  name: string;
  speciesId: string;
  level: number;
  experience: number;
  roomId: string;
  status: CharacterStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionRecord = {
  id: string;
  accountId: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  lastSeenAt: Date;
};

export type InviteRecord = {
  id: string;
  tokenHash: string;
  role: InviteRole;
  createdByAccountId: string;
  createdAt: Date;
  expiresAt: Date;
  consumedAt?: Date;
};

export type CreateAccountInput = {
  username: string;
  passwordHash: string;
  role: AccountRole;
  status?: AccountStatus;
};

export type CreateCharacterInput = {
  accountId: string;
  name: string;
  speciesId: string;
  roomId: string;
  status?: CharacterStatus;
};

export type CreateSessionInput = {
  accountId: string;
  tokenHash: string;
  expiresAt: Date;
};

export type CreateInviteInput = {
  tokenHash: string;
  role: InviteRole;
  createdByAccountId: string;
  expiresAt: Date;
};

export interface AccountRepository {
  create(input: CreateAccountInput): Promise<AccountRecord>;
  getById(id: string): Promise<AccountRecord | undefined>;
  getByUsername(username: string): Promise<AccountRecord | undefined>;
  listByRole(role: AccountRole): Promise<AccountRecord[]>;
  updateStatus(id: string, status: AccountStatus): Promise<AccountRecord>;
  touchSignIn(id: string, at: Date): Promise<void>;
}

export interface CharacterRepository {
  create(input: CreateCharacterInput): Promise<CharacterRecord>;
  getById(id: string): Promise<CharacterRecord | undefined>;
  listByAccountId(accountId: string): Promise<CharacterRecord[]>;
  updateRoom(id: string, roomId: string): Promise<void>;
}

export interface SessionRepository {
  create(input: CreateSessionInput): Promise<SessionRecord>;
  getByTokenHash(tokenHash: string): Promise<SessionRecord | undefined>;
  revoke(id: string, at: Date): Promise<void>;
  revokeAllForAccount(accountId: string, at: Date): Promise<void>;
}

export interface InviteRepository {
  create(input: CreateInviteInput): Promise<InviteRecord>;
  getByTokenHash(tokenHash: string): Promise<InviteRecord | undefined>;
  consume(id: string, at: Date): Promise<boolean>;
}

export class DuplicateUsernameError extends Error {
  readonly code = "duplicate_username";

  constructor(username: string) {
    super(`Username "${username}" is already taken.`);
    this.name = "DuplicateUsernameError";
  }
}

export class AccountNotFoundError extends Error {
  readonly code = "account_not_found";

  constructor(accountId: string) {
    super(`Account "${accountId}" was not found.`);
    this.name = "AccountNotFoundError";
  }
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}
