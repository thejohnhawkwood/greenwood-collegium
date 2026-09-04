import {
  AccountNotFoundError,
  DuplicateUsernameError,
  normalizeUsername,
  type AccountRecord,
  type AccountRepository,
  type AccountRole,
  type AccountStatus,
  type CharacterRecord,
  type CharacterRepository,
  type CreateAccountInput,
  type CreateCharacterInput,
  type CreateInviteInput,
  type CreateSessionInput,
  type InviteRecord,
  type InviteRepository,
  type SessionRecord,
  type SessionRepository,
} from "./types.js";

export class InMemoryAccountRepository implements AccountRepository {
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

  async touchSignIn(id: string, at: Date): Promise<void> {
    const account = this.byId.get(id);
    if (!account) {
      throw new AccountNotFoundError(id);
    }
    this.byId.set(id, { ...account, lastSignInAt: at, updatedAt: at });
  }
}

export class InMemoryCharacterRepository implements CharacterRepository {
  private readonly byId = new Map<string, CharacterRecord>();

  constructor(private readonly accounts: AccountRepository) {}

  async create(input: CreateCharacterInput): Promise<CharacterRecord> {
    const account = await this.accounts.getById(input.accountId);
    if (!account) {
      throw new AccountNotFoundError(input.accountId);
    }
    const now = new Date();
    const record: CharacterRecord = {
      id: crypto.randomUUID(),
      accountId: input.accountId,
      name: input.name.trim(),
      speciesId: input.speciesId,
      level: 1,
      experience: 0,
      roomId: input.roomId,
      status: input.status ?? "active",
      createdAt: now,
      updatedAt: now,
    };
    this.byId.set(record.id, record);
    return record;
  }

  async getById(id: string): Promise<CharacterRecord | undefined> {
    return this.byId.get(id);
  }

  async listByAccountId(accountId: string): Promise<CharacterRecord[]> {
    return [...this.byId.values()].filter((character) => character.accountId === accountId);
  }

  async updateRoom(id: string, roomId: string): Promise<void> {
    const character = this.byId.get(id);
    if (!character) {
      return;
    }
    this.byId.set(id, { ...character, roomId, updatedAt: new Date() });
  }
}

export class InMemorySessionRepository implements SessionRepository {
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
  private readonly byId = new Map<string, InviteRecord>();

  async create(input: CreateInviteInput): Promise<InviteRecord> {
    const record: InviteRecord = {
      id: crypto.randomUUID(),
      tokenHash: input.tokenHash,
      role: input.role,
      createdByAccountId: input.createdByAccountId,
      createdAt: new Date(),
      expiresAt: input.expiresAt,
    };
    this.byId.set(record.id, record);
    return record;
  }

  async getByTokenHash(tokenHash: string): Promise<InviteRecord | undefined> {
    return [...this.byId.values()].find((invite) => invite.tokenHash === tokenHash);
  }

  async consume(id: string, at: Date): Promise<boolean> {
    const invite = this.byId.get(id);
    if (!invite || invite.consumedAt) {
      return false;
    }
    this.byId.set(id, { ...invite, consumedAt: at });
    return true;
  }
}

export function createMemoryStores() {
  const accounts = new InMemoryAccountRepository();
  const characters = new InMemoryCharacterRepository(accounts);
  const sessions = new InMemorySessionRepository();
  const invites = new InMemoryInviteRepository();
  return { accounts, characters, sessions, invites };
}
