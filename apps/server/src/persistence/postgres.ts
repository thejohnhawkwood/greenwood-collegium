import { and, eq, isNull } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { accounts, characters, invites, sessions } from "./schema.js";
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

  async listByRole(role: AccountRole): Promise<AccountRecord[]> {
    const rows = await this.db.select().from(accounts).where(eq(accounts.role, role));
    return rows.map(toAccount);
  }

  async updateStatus(id: string, status: AccountStatus): Promise<AccountRecord> {
    const [row] = await this.db
      .update(accounts)
      .set({ status, updatedAt: new Date() })
      .where(eq(accounts.id, id))
      .returning();
    if (!row) {
      throw new AccountNotFoundError(id);
    }
    return toAccount(row);
  }

  async touchSignIn(id: string, at: Date): Promise<void> {
    const [row] = await this.db
      .update(accounts)
      .set({ lastSignInAt: at, updatedAt: at })
      .where(eq(accounts.id, id))
      .returning({ id: accounts.id });
    if (!row) {
      throw new AccountNotFoundError(id);
    }
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

  async updateRoom(id: string, roomId: string): Promise<void> {
    await this.db
      .update(characters)
      .set({ roomId, updatedAt: new Date() })
      .where(eq(characters.id, id));
  }
}

export class PostgresSessionRepository implements SessionRepository {
  constructor(private readonly db: Database) {}

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
    await this.db.insert(sessions).values(record);
    return record;
  }

  async getByTokenHash(tokenHash: string): Promise<SessionRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.tokenHash, tokenHash))
      .limit(1);
    return row ? toSession(row) : undefined;
  }

  async revoke(id: string, at: Date): Promise<void> {
    await this.db.update(sessions).set({ revokedAt: at }).where(eq(sessions.id, id));
  }

  async revokeAllForAccount(accountId: string, at: Date): Promise<void> {
    await this.db
      .update(sessions)
      .set({ revokedAt: at })
      .where(and(eq(sessions.accountId, accountId), isNull(sessions.revokedAt)));
  }
}

export class PostgresInviteRepository implements InviteRepository {
  constructor(private readonly db: Database) {}

  async create(input: CreateInviteInput): Promise<InviteRecord> {
    const record: InviteRecord = {
      id: crypto.randomUUID(),
      tokenHash: input.tokenHash,
      role: input.role,
      createdByAccountId: input.createdByAccountId,
      createdAt: new Date(),
      expiresAt: input.expiresAt,
    };
    await this.db.insert(invites).values(record);
    return record;
  }

  async getByTokenHash(tokenHash: string): Promise<InviteRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(invites)
      .where(eq(invites.tokenHash, tokenHash))
      .limit(1);
    return row ? toInvite(row) : undefined;
  }

  async consume(id: string, at: Date): Promise<boolean> {
    const [row] = await this.db
      .update(invites)
      .set({ consumedAt: at })
      .where(and(eq(invites.id, id), isNull(invites.consumedAt)))
      .returning({ id: invites.id });
    return row !== undefined;
  }
}

function asDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function toAccount(row: typeof accounts.$inferSelect): AccountRecord {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.passwordHash,
    status: row.status as AccountRecord["status"],
    role: row.role as AccountRecord["role"],
    lastSignInAt: row.lastSignInAt ? asDate(row.lastSignInAt) : undefined,
    createdAt: asDate(row.createdAt),
    updatedAt: asDate(row.updatedAt),
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
    createdAt: asDate(row.createdAt),
    updatedAt: asDate(row.updatedAt),
  };
}

function toSession(row: typeof sessions.$inferSelect): SessionRecord {
  return {
    id: row.id,
    accountId: row.accountId,
    tokenHash: row.tokenHash,
    createdAt: asDate(row.createdAt),
    expiresAt: asDate(row.expiresAt),
    revokedAt: row.revokedAt ? asDate(row.revokedAt) : undefined,
    lastSeenAt: asDate(row.lastSeenAt),
  };
}

function toInvite(row: typeof invites.$inferSelect): InviteRecord {
  return {
    id: row.id,
    tokenHash: row.tokenHash,
    role: row.role as InviteRecord["role"],
    createdByAccountId: row.createdByAccountId,
    createdAt: asDate(row.createdAt),
    expiresAt: asDate(row.expiresAt),
    consumedAt: row.consumedAt ? asDate(row.consumedAt) : undefined,
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
