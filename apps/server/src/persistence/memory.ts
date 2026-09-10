import {
  AccountNotFoundError,
  CharacterNotFoundError,
  DuplicateCharacterNameError,
  DuplicateUsernameError,
  normalizeCharacterName,
  normalizeUsername,
  type AccountRecord,
  type AccountRepository,
  type AccountRole,
  type AccountStatus,
  type AuditLogRepository,
  type AuditRecord,
  type CharacterRecord,
  type CharacterRepository,
  type CreateAccountInput,
  type CreateCharacterInput,
  type CreateInviteInput,
  type CreateSessionInput,
  type InviteRecord,
  type InviteRepository,
  type ItemInstanceRecord,
  type ItemInstanceRepository,
  type ItemPlacementSeed,
  type QuestProgressRecord,
  type QuestProgressRepository,
  type SessionRecord,
  type SessionRepository,
  type UpdateCharacterCreationInput,
} from "./types.js";
import {
  InMemoryClassroomResetRepository,
  InMemoryModerationRepository,
} from "./moderation-memory.js";

export class InMemoryAccountRepository implements AccountRepository {
  deleteForReset(predicate: (record: AccountRecord) => boolean): void {
    for (const [id, record] of this.byId) {
      if (predicate(record)) this.byId.delete(id);
    }
  }
  private readonly byId = new Map<string, AccountRecord>();

  async create(input: CreateAccountInput): Promise<AccountRecord> {
    const username = normalizeUsername(input.username);
    if (username.length === 0) {
      throw new Error("Username is required.");
    }
    if ([...this.byId.values()].some((account) => account.username === username)) {
      throw new DuplicateUsernameError(username);
    }
    const now = new Date();
    const record: AccountRecord = {
      id: crypto.randomUUID(),
      username,
      passwordHash: input.passwordHash,
      status: input.status ?? "active",
      role: input.role,
      createdAt: now,
      updatedAt: now,
    };
    this.byId.set(record.id, record);
    return record;
  }

  async getById(id: string): Promise<AccountRecord | undefined> {
    return this.byId.get(id);
  }

  async getByUsername(username: string): Promise<AccountRecord | undefined> {
    const normalized = normalizeUsername(username);
    return [...this.byId.values()].find((account) => account.username === normalized);
  }

  async listByRole(role: AccountRole): Promise<AccountRecord[]> {
    return [...this.byId.values()].filter((account) => account.role === role);
  }

  async updateStatus(id: string, status: AccountStatus): Promise<AccountRecord> {
    const account = this.byId.get(id);
    if (!account) {
      throw new AccountNotFoundError(id);
    }
    const updated = { ...account, status, updatedAt: new Date() };
    this.byId.set(id, updated);
    return updated;
  }

  async rename(id: string, username: string): Promise<AccountRecord> {
    const current = await this.getById(id);
    if (!current) throw new AccountNotFoundError(id);
    const normalized = normalizeUsername(username);
    const taken = await this.getByUsername(normalized);
    if (taken && taken.id !== id) throw new DuplicateUsernameError(normalized);
    const updated = { ...current, username: normalized, updatedAt: new Date() };
    this.byId.set(id, updated);
    return updated;
  }

  async touchSignIn(id: string, at: Date): Promise<void> {
    const account = this.byId.get(id);
    if (!account) {
      throw new AccountNotFoundError(id);
    }
    this.byId.set(id, { ...account, lastSignInAt: at, updatedAt: at });
  }
}

export class InMemoryCharacterRepository implements CharacterRepository {
  deleteForReset(predicate: (record: CharacterRecord) => boolean): void {
    for (const [id, record] of this.byId) {
      if (predicate(record)) this.byId.delete(id);
    }
  }
  private readonly byId = new Map<string, CharacterRecord>();

  constructor(private readonly accounts: AccountRepository) {}

  async create(input: CreateCharacterInput): Promise<CharacterRecord> {
    const account = await this.accounts.getById(input.accountId);
    if (!account) {
      throw new AccountNotFoundError(input.accountId);
    }
    const name = input.name.trim();
    if (await this.getByNormalizedName(name)) {
      throw new DuplicateCharacterNameError(name);
    }
    const now = new Date();
    const record: CharacterRecord = {
      id: crypto.randomUUID(),
      accountId: input.accountId,
      name,
      speciesId: input.speciesId,
      gender: input.gender,
      level: 1,
      experience: 0,
      roomId: input.roomId,
      status: input.status ?? "active",
      creationCompletedAt: input.creationCompletedAt,
      createdAt: now,
      updatedAt: now,
    };
    this.byId.set(record.id, record);
    return record;
  }

  async getById(id: string): Promise<CharacterRecord | undefined> {
    return this.byId.get(id);
  }

  async getByNormalizedName(name: string): Promise<CharacterRecord | undefined> {
    const needle = normalizeCharacterName(name);
    return [...this.byId.values()].find(
      (character) => normalizeCharacterName(character.name) === needle,
    );
  }

  async listByAccountId(accountId: string): Promise<CharacterRecord[]> {
    return [...this.byId.values()].filter((character) => character.accountId === accountId);
  }

  async updateCreation(id: string, input: UpdateCharacterCreationInput): Promise<CharacterRecord> {
    const character = this.byId.get(id);
    if (!character) {
      throw new CharacterNotFoundError(id);
    }
    const taken = await this.getByNormalizedName(input.name);
    if (taken && taken.id !== id) {
      throw new DuplicateCharacterNameError(input.name);
    }
    const updated: CharacterRecord = {
      ...character,
      name: input.name.trim(),
      speciesId: input.speciesId,
      gender: input.gender,
      creationCompletedAt: input.creationCompletedAt,
      updatedAt: new Date(),
    };
    this.byId.set(id, updated);
    return updated;
  }

  async updateRoom(id: string, roomId: string): Promise<void> {
    const character = this.byId.get(id);
    if (!character) {
      return;
    }
    this.byId.set(id, { ...character, roomId, updatedAt: new Date() });
  }

  async updateProgress(id: string, input: { experience: number; level: number }): Promise<void> {
    const character = this.byId.get(id);
    if (!character) {
      return;
    }
    this.byId.set(id, {
      ...character,
      experience: input.experience,
      level: input.level,
      updatedAt: new Date(),
    });
  }
}

export class InMemorySessionRepository implements SessionRepository {
  deleteForReset(predicate: (record: SessionRecord) => boolean): void {
    for (const [id, record] of this.byId) {
      if (predicate(record)) this.byId.delete(id);
    }
  }
  private readonly byId = new Map<string, SessionRecord>();

  async create(input: CreateSessionInput): Promise<SessionRecord> {
    const now = new Date();
    const record: SessionRecord = {
      id: crypto.randomUUID(),
      accountId: input.accountId,
      tokenHash: input.tokenHash,
      createdAt: now,
      expiresAt: input.expiresAt,
      lastSeenAt: now,
    };
    this.byId.set(record.id, record);
    return record;
  }

  async getByTokenHash(tokenHash: string): Promise<SessionRecord | undefined> {
    return [...this.byId.values()].find((session) => session.tokenHash === tokenHash);
  }

  async revoke(id: string, at: Date): Promise<void> {
    const session = this.byId.get(id);
    if (!session) {
      return;
    }
    this.byId.set(id, { ...session, revokedAt: at });
  }

  async revokeAllForAccount(accountId: string, at: Date): Promise<void> {
    for (const session of this.byId.values()) {
      if (session.accountId === accountId && !session.revokedAt) {
        this.byId.set(session.id, { ...session, revokedAt: at });
      }
    }
  }
}

export class InMemoryInviteRepository implements InviteRepository {
  deleteForReset(predicate: (record: InviteRecord) => boolean): void {
    for (const [id, record] of this.byId) {
      if (predicate(record)) this.byId.delete(id);
    }
  }
  private readonly byId = new Map<string, InviteRecord>();

  async create(input: CreateInviteInput): Promise<InviteRecord> {
    const record: InviteRecord = {
      id: crypto.randomUUID(),
      tokenHash: input.tokenHash,
      role: input.role,
      createdByAccountId: input.createdByAccountId,
      createdAt: new Date(),
      expiresAt: input.expiresAt,
      issuedToken: input.issuedToken,
    };
    this.byId.set(record.id, record);
    return record;
  }

  async getByTokenHash(tokenHash: string): Promise<InviteRecord | undefined> {
    return [...this.byId.values()].find((invite) => invite.tokenHash === tokenHash);
  }

  async list(): Promise<InviteRecord[]> {
    return [...this.byId.values()].sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    );
  }

  async consume(id: string, at: Date, consumedByAccountId?: string): Promise<boolean> {
    const invite = this.byId.get(id);
    if (!invite || invite.consumedAt) {
      return false;
    }
    this.byId.set(id, {
      ...invite,
      consumedAt: at,
      issuedToken: undefined,
      consumedByAccountId,
    });
    return true;
  }
}

export class InMemoryItemRepository implements ItemInstanceRepository {
  deleteForReset(predicate: (record: ItemInstanceRecord) => boolean): void {
    for (const [id, record] of this.byId) {
      if (predicate(record)) this.byId.delete(id);
    }
  }
  private readonly byId = new Map<string, ItemInstanceRecord>();

  async ensurePlacements(seeds: readonly ItemPlacementSeed[]): Promise<void> {
    const now = new Date();
    for (const seed of seeds) {
      if (this.byId.has(seed.id)) {
        continue;
      }
      this.byId.set(seed.id, {
        id: seed.id,
        templateId: seed.templateId,
        roomId: seed.roomId,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  async list(): Promise<ItemInstanceRecord[]> {
    return [...this.byId.values()];
  }

  async claim(itemId: string, characterId: string, roomId: string): Promise<boolean> {
    const item = this.byId.get(itemId);
    if (!item || item.holderCharacterId || item.roomId !== roomId) {
      return false;
    }
    this.byId.set(itemId, {
      ...item,
      holderCharacterId: characterId,
      roomId: undefined,
      updatedAt: new Date(),
    });
    return true;
  }

  async release(itemId: string, characterId: string, roomId: string): Promise<boolean> {
    const item = this.byId.get(itemId);
    if (!item || item.holderCharacterId !== characterId || item.roomId) {
      return false;
    }
    this.byId.set(itemId, {
      ...item,
      holderCharacterId: undefined,
      roomId,
      updatedAt: new Date(),
    });
    return true;
  }
}

export class InMemoryQuestRepository implements QuestProgressRepository {
  deleteForReset(predicate: (record: QuestProgressRecord) => boolean): void {
    for (const [id, record] of this.byKey) {
      if (predicate(record)) this.byKey.delete(id);
    }
  }
  private readonly byKey = new Map<string, QuestProgressRecord>();

  async listByCharacter(characterId: string): Promise<QuestProgressRecord[]> {
    return [...this.byKey.values()].filter((record) => record.characterId === characterId);
  }

  async upsert(record: Omit<QuestProgressRecord, "createdAt" | "updatedAt">): Promise<void> {
    const key = `${record.characterId}:${record.questId}`;
    const previous = this.byKey.get(key);
    const now = new Date();
    this.byKey.set(key, {
      ...record,
      completedObjectiveIds: [...record.completedObjectiveIds],
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    });
  }
}

export class InMemoryAuditRepository implements AuditLogRepository {
  private readonly rows: AuditRecord[] = [];

  async append(record: Omit<AuditRecord, "id">): Promise<AuditRecord> {
    const stored: AuditRecord = { ...record, id: crypto.randomUUID() };
    this.rows.unshift(stored);
    if (this.rows.length > 200) {
      this.rows.length = 200;
    }
    return stored;
  }

  async listRecent(limit: number): Promise<AuditRecord[]> {
    return this.rows.slice(0, Math.max(0, limit));
  }
}

export function createMemoryStores() {
  const accounts = new InMemoryAccountRepository();
  const characters = new InMemoryCharacterRepository(accounts);
  const sessions = new InMemorySessionRepository();
  const invites = new InMemoryInviteRepository();
  const items = new InMemoryItemRepository();
  const quests = new InMemoryQuestRepository();
  const audit = new InMemoryAuditRepository();
  const moderation = new InMemoryModerationRepository();
  const reset = new InMemoryClassroomResetRepository({
    accounts,
    characters,
    sessions,
    invites,
    items,
    quests,
    moderation,
  });
  return { accounts, characters, sessions, invites, items, quests, audit, moderation, reset };
}
