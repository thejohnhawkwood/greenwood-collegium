export type AccountStatus = "active" | "disabled";
export type AccountRole = "owner" | "teacher" | "student";
export type CharacterStatus = "active" | "disabled";

export type AccountRecord = {
  id: string;
  username: string;
  passwordHash: string;
  status: AccountStatus;
  role: AccountRole;
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

export interface AccountRepository {
  create(input: CreateAccountInput): Promise<AccountRecord>;
  getById(id: string): Promise<AccountRecord | undefined>;
  getByUsername(username: string): Promise<AccountRecord | undefined>;
}

export interface CharacterRepository {
  create(input: CreateCharacterInput): Promise<CharacterRecord>;
  getById(id: string): Promise<CharacterRecord | undefined>;
  listByAccountId(accountId: string): Promise<CharacterRecord[]>;
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
