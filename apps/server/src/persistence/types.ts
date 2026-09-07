export type AccountStatus = "active" | "disabled";
export type AccountRole = "owner" | "teacher" | "student";
export type CharacterStatus = "active" | "disabled";
export type CharacterGender = "female" | "male" | "nonbinary";
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
  gender?: CharacterGender;
  level: number;
  experience: number;
  roomId: string;
  status: CharacterStatus;
  creationCompletedAt?: Date;
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
  issuedToken?: string;
  consumedByAccountId?: string;
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
  gender?: CharacterGender;
  status?: CharacterStatus;
  creationCompletedAt?: Date;
};

export type UpdateCharacterCreationInput = {
  name: string;
  speciesId: string;
  gender: CharacterGender;
  creationCompletedAt: Date;
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
  issuedToken?: string;
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
  getByNormalizedName(name: string): Promise<CharacterRecord | undefined>;
  listByAccountId(accountId: string): Promise<CharacterRecord[]>;
  updateCreation(id: string, input: UpdateCharacterCreationInput): Promise<CharacterRecord>;
  updateRoom(id: string, roomId: string): Promise<void>;
  updateProgress(id: string, input: { experience: number; level: number }): Promise<void>;
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
  list(): Promise<InviteRecord[]>;
  consume(id: string, at: Date, consumedByAccountId?: string): Promise<boolean>;
}

export type ItemInstanceRecord = {
  id: string;
  templateId: string;
  roomId?: string;
  holderCharacterId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ItemPlacementSeed = {
  id: string;
  templateId: string;
  roomId: string;
};

export interface ItemInstanceRepository {
  ensurePlacements(seeds: readonly ItemPlacementSeed[]): Promise<void>;
  list(): Promise<ItemInstanceRecord[]>;
  claim(itemId: string, characterId: string, roomId: string): Promise<boolean>;
  release(itemId: string, characterId: string, roomId: string): Promise<boolean>;
}

export type QuestProgressRecord = {
  characterId: string;
  questId: string;
  status: "active" | "completed";
  completedObjectiveIds: string[];
  rewardGranted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface QuestProgressRepository {
  listByCharacter(characterId: string): Promise<QuestProgressRecord[]>;
  upsert(record: Omit<QuestProgressRecord, "createdAt" | "updatedAt">): Promise<void>;
}

export type AuditAction = "announce" | "inspect" | "mute" | "kick" | "remove";

export type AuditRecord = {
  id: string;
  at: Date;
  actorAccountId: string;
  actorUsername: string;
  action: AuditAction;
  targetName?: string;
  detail: string;
};

export interface AuditLogRepository {
  append(record: Omit<AuditRecord, "id">): Promise<AuditRecord>;
  listRecent(limit: number): Promise<AuditRecord[]>;
}

export class DuplicateUsernameError extends Error {
  readonly code = "duplicate_username";

  constructor(username: string) {
    super(`Username "${username}" is already taken.`);
    this.name = "DuplicateUsernameError";
  }
}

export class DuplicateCharacterNameError extends Error {
  readonly code = "duplicate_character_name";

  constructor(name: string) {
    super(`The name "${name}" is already taken.`);
    this.name = "DuplicateCharacterNameError";
  }
}

export class CharacterNotFoundError extends Error {
  readonly code = "character_not_found";

  constructor(characterId: string) {
    super(`Character "${characterId}" was not found.`);
    this.name = "CharacterNotFoundError";
  }
}

export function normalizeCharacterName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
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
