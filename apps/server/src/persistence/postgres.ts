import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { accounts, characters } from "./schema.js";
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

type Database = NodePgDatabase;

export class PostgresAccountRepository implements AccountRepository {
  constructor(private readonly db: Database) {}

  async create(input: CreateAccountInput): Promise<AccountRecord> {
    const username = normalizeUsername(input.username);
    if (username.length === 0) {
      throw new Error("Username is required.");
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
    try {
      await this.db.insert(accounts).values(record);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new DuplicateUsernameError(username);
      }
      throw error;
    }
    return record;
  }

  async getById(id: string): Promise<AccountRecord | undefined> {
    const [row] = await this.db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
    return row ? toAccount(row) : undefined;
  }

  async getByUsername(username: string): Promise<AccountRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.username, normalizeUsername(username)))
      .limit(1);
    return row ? toAccount(row) : undefined;
  }
}

export class PostgresCharacterRepository implements CharacterRepository {
  constructor(
    private readonly db: Database,
    private readonly accountRepository: AccountRepository,
  ) {}

  async create(input: CreateCharacterInput): Promise<CharacterRecord> {
    const account = await this.accountRepository.getById(input.accountId);
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
    await this.db.insert(characters).values(record);
    return record;
  }

  async getById(id: string): Promise<CharacterRecord | undefined> {
    const [row] = await this.db.select().from(characters).where(eq(characters.id, id)).limit(1);
    return row ? toCharacter(row) : undefined;
  }

  async listByAccountId(accountId: string): Promise<CharacterRecord[]> {
    const rows = await this.db.select().from(characters).where(eq(characters.accountId, accountId));
    return rows.map(toCharacter);
  }
}

function toAccount(row: typeof accounts.$inferSelect): AccountRecord {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.passwordHash,
    status: row.status as AccountRecord["status"],
    role: row.role as AccountRecord["role"],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toCharacter(row: typeof characters.$inferSelect): CharacterRecord {
  return {
    id: row.id,
    accountId: row.accountId,
    name: row.name,
    speciesId: row.speciesId,
    level: row.level,
    experience: row.experience,
    roomId: row.roomId,
    status: row.status as CharacterRecord["status"],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && typeof current === "object" && current !== null; depth += 1) {
    if ("code" in current && current.code === "23505") {
      return true;
    }
    current = "cause" in current ? current.cause : undefined;
  }
  return false;
}
