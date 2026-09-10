import { and, asc, desc, eq, gt, gte, inArray, lt, or, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { SpeechRecord } from "@greenwood/contracts";
import {
  accounts,
  characters,
  classroomSettings,
  invites,
  itemInstances,
  moderationState,
  questProgress,
  sessions,
  speechLog,
} from "./schema.js";
import type {
  ClassroomResetRepository,
  ModerationRepository,
  ModerationState,
  SpeechInput,
  SpeechQuery,
} from "./moderation-types.js";

export class PostgresModerationRepository implements ModerationRepository {
  constructor(private readonly db: NodePgDatabase) {}
  async get(accountId: string): Promise<ModerationState> {
    const [row] = await this.db
      .select()
      .from(moderationState)
      .where(eq(moderationState.accountId, accountId));
    return row?.value ?? {};
  }
  async put(accountId: string, value: ModerationState): Promise<void> {
    await this.db
      .insert(moderationState)
      .values({ accountId, value })
      .onConflictDoUpdate({ target: moderationState.accountId, set: { value } });
  }
  async chatPaused(): Promise<boolean> {
    const [row] = await this.db
      .select()
      .from(classroomSettings)
      .where(eq(classroomSettings.id, "realm"));
    return row?.chatPaused ?? false;
  }
  async pauseChat(chatPaused: boolean): Promise<void> {
    await this.db
      .insert(classroomSettings)
      .values({ id: "realm", chatPaused })
      .onConflictDoUpdate({ target: classroomSettings.id, set: { chatPaused } });
  }
  async appendSpeech(input: SpeechInput): Promise<boolean> {
    const { text, occurredAt, ...fields } = input;
    const rows = await this.db
      .insert(speechLog)
      .values({ ...fields, content: text, occurredAt: new Date(occurredAt) })
      .onConflictDoNothing({ target: [speechLog.accountId, speechLog.commandId] })
      .returning({ id: speechLog.id });
    return rows.length === 1;
  }
  async speech(query: SpeechQuery): Promise<SpeechRecord[]> {
    const rows = await this.db
      .select()
      .from(speechLog)
      .where(
        and(
          eq(speechLog.day, query.day),
          gt(speechLog.id, query.after),
          gte(speechLog.occurredAt, new Date(query.since)),
          query.accountId ? eq(speechLog.accountId, query.accountId) : undefined,
          query.roomId ? eq(speechLog.roomId, query.roomId) : undefined,
        ),
      )
      .orderBy(asc(speechLog.id))
      .limit(query.limit);
    return rows.map((row) => ({
      id: row.id,
      occurredAt: row.occurredAt.toISOString(),
      day: row.day,
      accountId: row.accountId,
      characterId: row.characterId,
      username: row.username,
      characterName: row.characterName,
      inviteReference: row.inviteReference ?? undefined,
      roomId: row.roomId,
      text: row.content,
    }));
  }
  async speechDays(since: string): Promise<string[]> {
    const rows = await this.db
      .selectDistinct({ day: speechLog.day })
      .from(speechLog)
      .where(gte(speechLog.occurredAt, new Date(since)))
      .orderBy(desc(speechLog.day));
    return rows.map((row) => row.day);
  }
  async pruneSpeech(before: string): Promise<void> {
    await this.db.delete(speechLog).where(lt(speechLog.occurredAt, new Date(before)));
  }
}

async function purgeCharacters(
  db: Pick<NodePgDatabase, "select" | "delete">,
  accountIds: string[],
): Promise<string[]> {
  if (!accountIds.length) return [];
  const ids = (
    await db
      .select({ id: characters.id })
      .from(characters)
      .where(inArray(characters.accountId, accountIds))
  ).map((row) => row.id);
  if (!ids.length) return [];
  await db.delete(questProgress).where(inArray(questProgress.characterId, ids));
  await db
    .delete(itemInstances)
    .where(
      or(
        inArray(itemInstances.holderCharacterId, ids),
        ...ids.map((id) => sql`right(${itemInstances.id}, ${id.length + 2}) = ${`--${id}`}`),
      ),
    );
  await db.delete(characters).where(inArray(characters.id, ids));
  return ids;
}
export class PostgresClassroomResetRepository implements ClassroomResetRepository {
  constructor(private readonly db: NodePgDatabase) {}
  async purgeCharacter(accountId: string): Promise<string[]> {
    return this.db.transaction((tx) => purgeCharacters(tx, [accountId]));
  }
  async purgeStudents() {
    return this.db.transaction(async (tx) => {
      const accountIds = (
        await tx
          .select({ id: accounts.id })
          .from(accounts)
          .where(eq(accounts.role, "student"))
          .for("update")
      ).map((row) => row.id);
      const characterIds = await purgeCharacters(tx, accountIds);
      const removedInvites = await tx
        .delete(invites)
        .where(
          or(
            eq(invites.role, "student"),
            accountIds.length ? inArray(invites.consumedByAccountId, accountIds) : undefined,
          ),
        )
        .returning({ id: invites.id });
      if (accountIds.length) {
        await tx.delete(sessions).where(inArray(sessions.accountId, accountIds));
        await tx.delete(accounts).where(inArray(accounts.id, accountIds));
      }
      return { accountIds, characterIds, invites: removedInvites.length };
    });
  }
}
