import { expect, it } from "vitest";
import type {
  ClassroomResetRepository,
  ModerationRepository,
  SpeechInput,
} from "./moderation-types.js";
import {
  DuplicateUsernameError,
  type AccountRepository,
  type CharacterRepository,
  type InviteRepository,
  type ItemInstanceRepository,
  type QuestProgressRepository,
  type SessionRepository,
} from "./types.js";

type Stores = {
  accounts: AccountRepository;
  characters: CharacterRepository;
  invites: InviteRepository;
  items: ItemInstanceRepository;
  quests: QuestProgressRepository;
  sessions: SessionRepository;
  moderation: ModerationRepository;
  reset: ClassroomResetRepository;
};

export function persistModeration(getStores: () => Stores) {
  it("persists reviewed names, restrictions and pause through repository reconstruction", async () => {
    const s = getStores();
    const account = await s.accounts.create({
      username: "moderation-pupil",
      passwordHash: "fictional",
      role: "student",
    });
    const other = await s.accounts.create({
      username: "moderation-other",
      passwordHash: "fictional",
      role: "student",
    });
    await s.accounts.rename(account.id, "REVISED-pupil");
    expect(await s.accounts.getByUsername("moderation-pupil")).toBeUndefined();
    expect(await s.accounts.getByUsername("revised-PUPIL")).toMatchObject({ id: account.id });
    await expect(s.accounts.rename(account.id, other.username)).rejects.toBeInstanceOf(
      DuplicateUsernameError,
    );
    const state = {
      review: { revision: "review-1", status: "approved" as const },
      mutedUntil: "2026-09-10T19:00:00.000Z",
      timeoutUntil: "2026-09-10T18:10:00.000Z",
    };
    await s.moderation.put(account.id, state);
    await s.moderation.pauseChat(true);
    expect(await getStores().moderation.get(account.id)).toEqual(state);
    expect(await getStores().moderation.chatPaused()).toBe(true);
    await s.moderation.put(account.id, { review: state.review });
    expect(await getStores().moderation.get(account.id)).toEqual({ review: state.review });
    await s.moderation.pauseChat(false);
  });

  it("deduplicates speech, pages by stable ID, filters days and prunes old records", async () => {
    const s = getStores();
    const input: SpeechInput = {
      commandId: "first",
      accountId: "fictional-speaker",
      characterId: "fictional-character",
      occurredAt: "2026-09-10T18:00:00.000Z",
      day: "2026-09-10",
      username: "pupil",
      characterName: "Hazel",
      inviteReference: "fictional-reference",
      roomId: "great-hall",
      text: "Fictional speech",
    };
    expect(await s.moderation.appendSpeech(input)).toBe(true);
    expect(await getStores().moderation.appendSpeech(input)).toBe(false);
    await s.moderation.appendSpeech({ ...input, commandId: "second", text: "Next fictional line" });
    await s.moderation.appendSpeech({
      ...input,
      commandId: "old",
      day: "2026-01-01",
      occurredAt: "2026-01-01T18:00:00.000Z",
    });
    const query = {
      day: input.day,
      after: 0,
      limit: 1,
      since: "2026-03-10T18:00:00.000Z",
      accountId: input.accountId,
    };
    const first = await getStores().moderation.speech(query);
    expect(first).toHaveLength(1);
    expect(first[0]).toMatchObject({ text: input.text, inviteReference: input.inviteReference });
    expect(await s.moderation.speech({ ...query, after: first[0]?.id ?? 0 })).toMatchObject([
      { text: "Next fictional line" },
    ]);
    expect(await s.moderation.speech({ ...query, roomId: "other-room" })).toEqual([]);
    expect(await s.moderation.speechDays(query.since)).toEqual([input.day]);
    await s.moderation.pruneSpeech(query.since);
    expect(
      await s.moderation.speech({ ...query, day: "2026-01-01", since: "2000-01-01T00:00:00.000Z" }),
    ).toEqual([]);
  });

  it("purges student-owned state and old invites while preserving staff and speech snapshots", async () => {
    const s = getStores();
    const staff = await s.accounts.create({
      username: "reset-staff",
      passwordHash: "fictional",
      role: "teacher",
    });
    const pupil = await s.accounts.create({
      username: "reset-pupil",
      passwordHash: "fictional",
      role: "student",
    });
    const character = await s.characters.create({
      accountId: pupil.id,
      name: "Reset Pupil",
      speciesId: "mouse",
      roomId: "lantern-court",
    });
    const staffCharacter = await s.characters.create({
      accountId: staff.id,
      name: "Reset Staff",
      speciesId: "hare",
      roomId: "lantern-court",
    });
    const expiresAt = new Date("2030-01-01T00:00:00.000Z");
    await s.sessions.create({ accountId: pupil.id, tokenHash: "reset-session", expiresAt });
    const staffInvite = await s.invites.create({
      createdByAccountId: staff.id,
      role: "teacher",
      tokenHash: "staff-invite",
      expiresAt,
    });
    const oldInvite = await s.invites.create({
      createdByAccountId: staff.id,
      role: "student",
      tokenHash: "old-invite",
      expiresAt,
    });
    await s.invites.consume(oldInvite.id, new Date(), pupil.id);
    await s.invites.create({
      createdByAccountId: staff.id,
      role: "student",
      tokenHash: "unused-invite",
      expiresAt,
    });
    await s.quests.upsert({
      characterId: character.id,
      questId: "arrival",
      status: "active",
      completedObjectiveIds: ["look"],
      rewardGranted: false,
    });
    const personalId = `personal--${character.id}`;
    await s.items.ensurePlacements([
      { id: "held-reset-key", templateId: "key", roomId: "lantern-court" },
      { id: personalId, templateId: "key", roomId: "lantern-court" },
      { id: "staff-reset-key", templateId: "key", roomId: "lantern-court" },
    ]);
    await s.items.claim("held-reset-key", character.id, "lantern-court");
    await s.items.claim("staff-reset-key", staffCharacter.id, "lantern-court");
    await s.moderation.put(pupil.id, { mutedUntil: expiresAt.toISOString() });
    await s.moderation.appendSpeech({
      commandId: "retained",
      accountId: pupil.id,
      characterId: character.id,
      occurredAt: "2026-09-10T18:00:00.000Z",
      day: "2026-09-10",
      username: pupil.username,
      characterName: character.name,
      inviteReference: oldInvite.id,
      roomId: "lantern-court",
      text: "Fictional retained evidence",
    });
    const reset = await s.reset.purgeStudents();
    expect(reset.accountIds).toContain(pupil.id);
    expect(reset.accountIds).not.toContain(staff.id);
    expect(await s.accounts.getById(pupil.id)).toBeUndefined();
    expect(await s.characters.getById(character.id)).toBeUndefined();
    expect(await s.characters.getById(staffCharacter.id)).toBeDefined();
    expect(await s.quests.listByCharacter(character.id)).toEqual([]);
    expect(await s.sessions.getByTokenHash("reset-session")).toBeUndefined();
    expect(await s.moderation.get(pupil.id)).toEqual({});
    const items = await s.items.list();
    expect(items.some((row) => row.id === "held-reset-key" || row.id === personalId)).toBe(false);
    expect(items.find((row) => row.id === "staff-reset-key")?.holderCharacterId).toBe(
      staffCharacter.id,
    );
    const invites = await s.invites.list();
    expect(invites.some((row) => row.role === "student")).toBe(false);
    expect(invites.some((row) => row.id === staffInvite.id)).toBe(true);
    expect(
      await s.moderation.speech({
        day: "2026-09-10",
        after: 0,
        limit: 200,
        since: "2026-03-10T00:00:00.000Z",
        accountId: pupil.id,
      }),
    ).toMatchObject([{ text: "Fictional retained evidence", inviteReference: oldInvite.id }]);
  });
}
