import type { Appearance } from "@greenwood/contracts";
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
  appearance?: Appearance;
  discoveredRoomIds?: string[];
  id: string;
  accountId: string;
  name: string;
  speciesId: string;
  gender?: CharacterGender;
  level: number;
  experience: number;
  roomId: string;
  schoolId?: string;
  defeatedSpawnIds?: string[];
  knownSpells?: KnownSpellRecord[];
  pendingPrimerChoices?: PendingPrimerRecord;
  primerAwardedLevels?: number[];
  status: CharacterStatus;
  creationCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export function resolveDiscoveredRoomIds(
  value: unknown,
  fallbackRoomId = "lantern-court",
): string[] {
  const ids = Array.isArray(value)
    ? value.filter((id): id is string => typeof id === "string" && /^[a-z][a-z0-9-]*$/u.test(id))
    : [];
  const unique = [...new Set(ids.length > 0 ? ids : [fallbackRoomId])];
  if (!unique.includes(fallbackRoomId) && ids.length === 0) {
    return [fallbackRoomId];
  }
  return unique;
}

export function resolveDefeatedSpawnIds(value: unknown): string[] {
  const ids = Array.isArray(value)
    ? value.filter((id): id is string => typeof id === "string" && /^[a-z][a-z0-9-]*$/u.test(id))
    : [];
  return [...new Set(ids)];
}

export type KnownSpellRecord = {
  spellId: string;
  rank: number;
  pennedBy: string;
};

export type PendingPrimerRecord = {
  level: number;
  options: Array<{
    kind: "upgrade" | "unlock" | "courtesy" | "vital";
    spellId?: string;
    rank?: number;
    schoolId?: string;
    tag?: string;
    vitalHealth?: number;
    vitalFocus?: number;
  }>;
  commandId?: string;
};

const SPELL_ID = /^[a-z][a-z0-9-]*$/u;
const PRIMER_KINDS = new Set(["upgrade", "unlock", "courtesy", "vital"]);
const RETIRED_SPELL_IDS: Record<string, string> = {
  "coal-breath": "flame-breath",
  "banked-coals": "heart-fire",
  "ash-shroud": "blaze-mantle",
  kiln: "stoke",
  measure: "draw",
};

function resolveSpellId(spellId: string): string {
  return RETIRED_SPELL_IDS[spellId] ?? spellId;
}

export function resolveKnownSpells(value: unknown): KnownSpellRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set<string>();
  const leaves: KnownSpellRecord[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object") {
      continue;
    }
    const record = row as Record<string, unknown>;
    const spellId = typeof record.spellId === "string" ? resolveSpellId(record.spellId) : "";
    const rank = typeof record.rank === "number" ? Math.floor(record.rank) : 0;
    const pennedBy = typeof record.pennedBy === "string" ? record.pennedBy.slice(0, 80) : "";
    if (
      !SPELL_ID.test(spellId) ||
      rank < 1 ||
      rank > 5 ||
      pennedBy.length === 0 ||
      seen.has(spellId)
    ) {
      continue;
    }
    seen.add(spellId);
    leaves.push({ spellId, rank, pennedBy });
  }
  return leaves;
}

export function resolvePendingPrimer(value: unknown): PendingPrimerRecord | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const level = typeof record.level === "number" ? Math.floor(record.level) : 0;
  if (level < 4 || level > 20 || !Array.isArray(record.options) || record.options.length === 0) {
    return undefined;
  }
  const options = record.options.flatMap((raw) => {
    if (!raw || typeof raw !== "object") {
      return [];
    }
    const card = raw as Record<string, unknown>;
    const kind =
      typeof card.kind === "string" && PRIMER_KINDS.has(card.kind) ? card.kind : undefined;
    if (!kind) {
      return [];
    }
    return [
      {
        kind: kind as PendingPrimerRecord["options"][number]["kind"],
        ...(typeof card.spellId === "string" && SPELL_ID.test(resolveSpellId(card.spellId))
          ? { spellId: resolveSpellId(card.spellId) }
          : {}),
        ...(typeof card.rank === "number"
          ? { rank: Math.min(5, Math.max(1, Math.floor(card.rank))) }
          : {}),
        ...(typeof card.schoolId === "string" && SPELL_ID.test(card.schoolId)
          ? { schoolId: card.schoolId }
          : {}),
        ...(typeof card.tag === "string" ? { tag: card.tag } : {}),
        ...(typeof card.vitalHealth === "number"
          ? { vitalHealth: Math.floor(card.vitalHealth) }
          : {}),
        ...(typeof card.vitalFocus === "number" ? { vitalFocus: Math.floor(card.vitalFocus) } : {}),
      },
    ];
  });
  if (options.length === 0) {
    return undefined;
  }
  return {
    level,
    options: options.slice(0, 3),
    ...(typeof record.commandId === "string" ? { commandId: record.commandId.slice(0, 80) } : {}),
  };
}

export function resolvePrimerAwardedLevels(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return [
    ...new Set(
      value
        .filter((level): level is number => typeof level === "number")
        .map((level) => Math.floor(level))
        .filter((level) => level >= 3 && level <= 20),
    ),
  ].sort((left, right) => left - right);
}

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
  appearance?: Appearance;
  accountId: string;
  name: string;
  speciesId: string;
  roomId: string;
  gender?: CharacterGender;
  status?: CharacterStatus;
  creationCompletedAt?: Date;
};

export type UpdateCharacterCreationInput = {
  appearance?: Appearance;
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
  rename(id: string, username: string): Promise<AccountRecord>;
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
  updateDiscovery(id: string, discoveredRoomIds: readonly string[]): Promise<void>;
  updateSchool(id: string, schoolId: string | undefined): Promise<void>;
  updateDefeatedSpawns(id: string, defeatedSpawnIds: readonly string[]): Promise<void>;
  updatePrimer(
    id: string,
    input: {
      knownSpells: readonly KnownSpellRecord[];
      pendingPrimerChoices?: PendingPrimerRecord;
      primerAwardedLevels: readonly number[];
    },
  ): Promise<void>;
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

export type AuditAction =
  | "announce"
  | "inspect"
  | "mute"
  | "kick"
  | "remove"
  | "approve"
  | "reject"
  | "timeout"
  | "unmute"
  | "end-timeout"
  | "disable"
  | "restore"
  | "remove-character"
  | "rename-character"
  | "chat-pause"
  | "reset-students";

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
