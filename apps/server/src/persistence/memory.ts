import {
  AccountNotFoundError,
  DuplicateUsernameError,
  normalizeUsername,
  type AccountRecord,
  type AccountRepository,
  type CharacterRecord,
  type CharacterRepository,
  type CreateAccountInput,
  type CreateCharacterInput,
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
}
