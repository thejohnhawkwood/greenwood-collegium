import type { SpeechRecord } from "@greenwood/contracts";
import type {
  ClassroomResetRepository,
  ModerationRepository,
  ModerationState,
  SpeechInput,
  SpeechQuery,
} from "./moderation-types.js";
import type {
  InMemoryAccountRepository,
  InMemoryCharacterRepository,
  InMemoryInviteRepository,
  InMemoryItemRepository,
  InMemoryQuestRepository,
  InMemorySessionRepository,
} from "./memory.js";

export class InMemoryModerationRepository implements ModerationRepository {
  private readonly states = new Map<string, ModerationState>();
  private paused = false;
  private rows: (SpeechRecord & { commandId: string })[] = [];
  private sequence = 0;
  deleteAccounts(accountIds: string[]): void {
    for (const id of accountIds) this.states.delete(id);
  }
  async get(accountId: string): Promise<ModerationState> {
    return structuredClone(this.states.get(accountId) ?? {});
  }
  async put(accountId: string, state: ModerationState): Promise<void> {
    this.states.set(accountId, structuredClone(state));
  }
  async chatPaused(): Promise<boolean> {
    return this.paused;
  }
  async pauseChat(paused: boolean): Promise<void> {
    this.paused = paused;
  }
  async appendSpeech(input: SpeechInput): Promise<boolean> {
    if (
      this.rows.some(
        (row) => row.accountId === input.accountId && row.commandId === input.commandId,
      )
    )
      return false;
    this.rows.push({ ...input, id: ++this.sequence });
    return true;
  }
  async speech(query: SpeechQuery): Promise<SpeechRecord[]> {
    return this.rows
      .filter(
        (row) =>
          row.day === query.day &&
          row.id > query.after &&
          row.occurredAt >= query.since &&
          (!query.accountId || row.accountId === query.accountId) &&
          (!query.roomId || row.roomId === query.roomId),
      )
      .slice(0, query.limit)
      .map(({ commandId: _commandId, ...row }) => ({ ...row }));
  }
  async speechDays(since: string): Promise<string[]> {
    return [...new Set(this.rows.filter((row) => row.occurredAt >= since).map((row) => row.day))]
      .sort()
      .reverse();
  }
  async pruneSpeech(before: string): Promise<void> {
    this.rows = this.rows.filter((row) => row.occurredAt >= before);
  }
}

type ResetStores = {
  accounts: InMemoryAccountRepository;
  characters: InMemoryCharacterRepository;
  sessions: InMemorySessionRepository;
  invites: InMemoryInviteRepository;
  items: InMemoryItemRepository;
  quests: InMemoryQuestRepository;
  moderation: InMemoryModerationRepository;
};
export class InMemoryClassroomResetRepository implements ClassroomResetRepository {
  constructor(private readonly stores: ResetStores) {}
  async purgeCharacter(accountId: string): Promise<string[]> {
    const ids = (await this.stores.characters.listByAccountId(accountId)).map((row) => row.id);
    this.stores.quests.deleteForReset((row) => ids.includes(row.characterId));
    this.stores.items.deleteForReset(
      (row) =>
        ids.includes(row.holderCharacterId ?? "") || ids.some((id) => row.id.endsWith(`--${id}`)),
    );
    this.stores.characters.deleteForReset((row) => ids.includes(row.id));
    return ids;
  }
  async purgeStudents() {
    const accountIds = (await this.stores.accounts.listByRole("student")).map((row) => row.id);
    const characterIds: string[] = [];
    for (const id of accountIds) characterIds.push(...(await this.purgeCharacter(id)));
    const invites = (await this.stores.invites.list()).filter(
      (row) => row.role === "student" || accountIds.includes(row.consumedByAccountId ?? ""),
    ).length;
    this.stores.sessions.deleteForReset((row) => accountIds.includes(row.accountId));
    this.stores.invites.deleteForReset(
      (row) => row.role === "student" || accountIds.includes(row.consumedByAccountId ?? ""),
    );
    this.stores.accounts.deleteForReset((row) => accountIds.includes(row.id));
    this.stores.moderation.deleteAccounts(accountIds);
    return { accountIds, characterIds, invites };
  }
}
