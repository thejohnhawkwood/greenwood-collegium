import { describe, expect, it } from "vitest";
import { createClassroomService, classroomDay, sixMonthsAgo } from "./classroom.js";
import { createOperationQueue } from "./operation-queue.js";
import { createTestAuth } from "../auth/test-harness.js";
import type { SpeechInput } from "../persistence/moderation-types.js";

async function setup() {
  let at = new Date("2026-09-10T18:00:00.000Z");
  const stores = createTestAuth(() => at);
  const classroom = createClassroomService({ ...stores, now: () => at });
  const owner = await stores.auth.bootstrap({
    token: stores.bootstrapToken,
    username: "teacher",
    password: "fictional-password",
  });
  if (!owner.ok) throw new Error(owner.message);
  const batch = await stores.auth.createInvite(owner.account.id, "student", 2);
  if (!batch.ok) throw new Error(batch.message);
  const student = await stores.auth.acceptInvite({
    token: batch.token,
    username: "pupil",
    password: "fictional-password",
  });
  if (!student.ok) throw new Error(student.message);
  const character = await stores.auth.completeCharacter(student.account.id, {
    name: "Hazel",
    speciesId: "mouse",
    gender: "female",
  });
  if (!character.ok) throw new Error(character.message);
  return {
    ...stores,
    classroom,
    owner,
    student,
    character: character.character,
    batch,
    advance: (ms: number) => {
      at = new Date(at.getTime() + ms);
    },
  };
}

describe("classroom admission and controls", () => {
  it("withholds sockets until both exact names are approved; rejects stale reviews and allows resubmission", async () => {
    const s = await setup();
    const pending = await s.auth.reviewStatus(s.student.account.id);
    expect(pending.status).toBe("pending");
    expect(await s.auth.resolvePlayIdentity(s.student.sessionToken)).toBeUndefined();
    expect(await s.auth.issueSocketTicket(s.student.account.id)).toBeUndefined();
    await s.classroom.moderate(s.owner.account.id, {
      action: "reject",
      accountId: s.student.account.id,
      revision: pending.revision ?? "",
      reason: "Choose a woodland name and a classroom login.",
    });
    expect((await s.auth.reviewStatus(s.student.account.id)).status).toBe("rejected");
    const revised = await s.auth.completeCharacter(s.student.account.id, {
      username: "pupil_revised",
      name: "Fern",
      speciesId: "hare",
      gender: "female",
    });
    expect(revised.ok).toBe(true);
    await expect(
      s.classroom.moderate(s.owner.account.id, {
        action: "approve",
        accountId: s.student.account.id,
        revision: pending.revision ?? "",
      }),
    ).rejects.toMatchObject({ status: 409 });
    const review = await s.auth.reviewStatus(s.student.account.id);
    await s.classroom.moderate(s.owner.account.id, {
      action: "approve",
      accountId: s.student.account.id,
      revision: review.revision ?? "",
    });
    expect(await s.auth.resolvePlayIdentity(s.student.sessionToken)).toMatchObject({
      username: "pupil_revised",
      characterName: "Fern the Hare",
    });
    expect(
      (
        await s.auth.completeCharacter(s.student.account.id, {
          name: "Changed",
          speciesId: "hare",
          gender: "female",
        })
      ).ok,
    ).toBe(false);
  });

  it("links the permanent invite reference to the account and character after the secret is consumed", async () => {
    const s = await setup();
    const roster = await s.auth.listClassroom(s.owner.account.id);
    if (!roster.ok) throw new Error(roster.message);
    const invite = roster.invites.find((row) => row.accountId === s.student.account.id);
    const account = roster.accounts.find((row) => row.accountId === s.student.account.id);
    expect(invite?.token).toBeUndefined();
    expect(invite?.characterId).toBe(s.character.id);
    expect(account?.inviteReference).toBe(invite?.id);
    expect(account?.characterName).toBe("Hazel the Mouse");
  });

  it("enforces mute, timeout, early release, and chat pause across reconstructed services", async () => {
    const s = await setup();
    await s.classroom.moderate(s.owner.account.id, {
      action: "approve",
      accountId: s.student.account.id,
      revision: (await s.auth.reviewStatus(s.student.account.id)).revision ?? "",
    });
    const identity = await s.auth.resolvePlayIdentity(s.student.sessionToken);
    if (!identity) throw new Error("Expected approved player");
    await s.classroom.moderate(s.owner.account.id, {
      action: "mute",
      accountId: identity.accountId,
      minutes: 10,
      reason: "Quiet reading",
    });
    const restarted = createClassroomService({
      ...s,
      now: () => new Date("2026-09-10T18:00:00.000Z"),
    });
    expect(await restarted.access(identity, true)).toContain("muted");
    expect(await restarted.access(identity)).toBeUndefined();
    s.advance(10 * 60_000);
    expect(await s.classroom.access(identity, true)).toBeUndefined();
    await s.classroom.moderate(s.owner.account.id, {
      action: "chat-pause",
      paused: true,
      reason: "Instructions",
    });
    expect(await s.classroom.access(identity, true)).toContain("paused student chat");
    expect(await s.classroom.access(identity)).toBeUndefined();
    await s.classroom.moderate(s.owner.account.id, {
      action: "chat-pause",
      paused: false,
      reason: "Continue",
    });
    await s.classroom.moderate(s.owner.account.id, {
      action: "timeout",
      accountId: identity.accountId,
      minutes: 5,
      reason: "Break",
    });
    expect(await s.auth.resolvePlayIdentity(s.student.sessionToken)).toBeUndefined();
    expect(await s.classroom.access(identity)).toBeDefined();
    await s.classroom.moderate(s.owner.account.id, {
      action: "end-timeout",
      accountId: identity.accountId,
      reason: "Return",
    });
    expect(await s.classroom.access(identity)).toBeUndefined();
    await s.classroom.moderate(s.owner.account.id, {
      action: "unmute",
      accountId: identity.accountId,
      reason: "Return",
    });
    expect((await s.moderation.get(identity.accountId)).mutedUntil).toBeUndefined();
  });

  it("rejects student administration and protects staff accounts", async () => {
    const s = await setup();
    await expect(
      s.classroom.moderate(s.student.account.id, {
        action: "chat-pause",
        paused: true,
        reason: "",
      }),
    ).rejects.toMatchObject({ status: 403 });
    await expect(s.classroom.days(s.student.account.id)).rejects.toMatchObject({ status: 403 });
    await expect(s.classroom.resetPreview(s.student.account.id)).rejects.toMatchObject({
      status: 403,
    });
    await expect(
      s.classroom.moderate(s.owner.account.id, {
        action: "disable",
        accountId: s.owner.account.id,
        reason: "",
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("removes a character without removing its login; disables and restores an account", async () => {
    const s = await setup();
    await s.classroom.moderate(s.owner.account.id, {
      action: "remove-character",
      accountId: s.student.account.id,
      reason: "Start again",
    });
    expect(await s.characters.listByAccountId(s.student.account.id)).toEqual([]);
    expect(await s.accounts.getById(s.student.account.id)).toBeDefined();
    expect((await s.auth.reviewStatus(s.student.account.id)).status).toBe("unsubmitted");
    await s.classroom.moderate(s.owner.account.id, {
      action: "disable",
      accountId: s.student.account.id,
      reason: "Removed",
    });
    expect(await s.auth.resolveSession(s.student.sessionToken)).toBeUndefined();
    await s.classroom.moderate(s.owner.account.id, {
      action: "restore",
      accountId: s.student.account.id,
      reason: "Restored",
    });
    expect((await s.auth.signIn({ username: "pupil", password: "fictional-password" })).ok).toBe(
      true,
    );
    expect(await s.auth.resolveSession(s.student.sessionToken)).toBeUndefined();
  });

  it("fully resets students and old invites, frees names, and retains staff and recorded evidence", async () => {
    const s = await setup();
    const speech: SpeechInput = {
      commandId: "command-1",
      occurredAt: "2026-09-10T18:00:00.000Z",
      day: "2026-09-10",
      accountId: s.student.account.id,
      characterId: s.character.id,
      username: "pupil",
      characterName: "Hazel the Mouse",
      inviteReference: "reference-snapshot",
      roomId: "lantern-court",
      text: "Fictional classroom speech.",
    };
    await s.moderation.appendSpeech(speech);
    const teacherInvite = await s.auth.createInvite(s.owner.account.id, "teacher");
    if (!teacherInvite.ok) throw new Error(teacherInvite.message);
    await s.items.ensurePlacements([
      { id: `key--${s.character.id}`, templateId: "small-key", roomId: "lantern-court" },
    ]);
    const preview = await s.classroom.resetPreview(s.owner.account.id);
    expect(preview).toMatchObject({ accounts: 1, characters: 1, invites: 2 });
    await s.classroom.resetStudents(s.owner.account.id, preview.revision);
    expect(await s.accounts.listByRole("student")).toEqual([]);
    expect(await s.characters.getById(s.character.id)).toBeUndefined();
    expect(await s.items.list()).toEqual([]);
    expect(await s.auth.resolveSession(s.student.sessionToken)).toBeUndefined();
    expect(await s.auth.resolveSession(s.owner.sessionToken)).toBeDefined();
    expect((await s.invites.list()).map((row) => row.role)).toEqual(["teacher"]);
    expect(
      (await s.classroom.speech(s.owner.account.id, { day: "2026-09-10", after: 0 })).records,
    ).toMatchObject([{ inviteReference: "reference-snapshot", text: speech.text }]);
    expect((await s.audit.listRecent(10)).some((row) => row.action === "reset-students")).toBe(
      true,
    );
    expect(
      (
        await s.auth.acceptInvite({
          token: s.batch.tokens[1] ?? "",
          username: "pupil",
          password: "fictional-password",
        })
      ).ok,
    ).toBe(false);
    const fresh = await s.auth.createInvite(s.owner.account.id, "student");
    if (!fresh.ok) throw new Error(fresh.message);
    expect(
      (
        await s.auth.acceptInvite({
          token: fresh.token,
          username: "pupil",
          password: "fictional-password",
        })
      ).ok,
    ).toBe(true);
  });

  it("requires a fresh reset preview if new invites or students were added", async () => {
    const s = await setup();
    const preview = await s.classroom.resetPreview(s.owner.account.id);
    await s.auth.createInvite(s.owner.account.id, "student");
    await expect(
      s.classroom.resetStudents(s.owner.account.id, preview.revision),
    ).rejects.toMatchObject({ status: 409 });
    expect(await s.accounts.getById(s.student.account.id)).toBeDefined();
  });
  it("still evicts students when an audit failure follows a timeout or reset", async () => {
    const s = await setup();
    const notifications: { disconnect: boolean; refreshSession?: boolean }[] = [];
    s.classroom.subscribe((change) => notifications.push(change));
    s.audit.append = async () => {
      throw new Error("Synthetic audit failure");
    };
    await expect(
      s.classroom.moderate(s.owner.account.id, {
        action: "timeout",
        accountId: s.student.account.id,
        minutes: 10,
        reason: "Break",
      }),
    ).rejects.toThrow("Synthetic audit failure");
    expect(notifications.at(-1)).toMatchObject({ disconnect: true, refreshSession: true });
    expect((await s.moderation.get(s.student.account.id)).timeoutUntil).toBeDefined();
    const preview = await s.classroom.resetPreview(s.owner.account.id);
    await expect(s.classroom.resetStudents(s.owner.account.id, preview.revision)).rejects.toThrow(
      "Synthetic audit failure",
    );
    expect(await s.accounts.getById(s.student.account.id)).toBeUndefined();
    expect(notifications).toHaveLength(2);
    expect(notifications.at(-1)).toMatchObject({ disconnect: true, refreshSession: true });
  });
});

describe("semester speech retention", () => {
  it("uses Alberta days and clamps six calendar months at month ends", () => {
    expect(classroomDay(new Date("2026-09-10T03:00:00Z"))).toBe("2026-09-09");
    expect(sixMonthsAgo(new Date("2026-08-31T18:00:00Z"))).toBe("2026-02-28T18:00:00.000Z");
    expect(sixMonthsAgo(new Date("2026-09-10T18:00:00Z"))).toBe("2026-03-10T18:00:00.000Z");
  });
  it("deduplicates speech, paginates in order, and excludes expired records before cleanup", async () => {
    const s = await setup();
    const base: SpeechInput = {
      commandId: "old",
      occurredAt: "2026-03-10T17:59:59.000Z",
      day: "2026-03-10",
      accountId: s.student.account.id,
      characterId: s.character.id,
      username: "pupil",
      characterName: "Hazel the Mouse",
      roomId: "lantern-court",
      text: "Fictional speech",
    };
    await s.moderation.appendSpeech(base);
    for (let i = 0; i < 205; i++)
      await s.moderation.appendSpeech({
        ...base,
        commandId: String(i),
        occurredAt: "2026-09-10T18:00:00.000Z",
        day: "2026-09-10",
      });
    expect(await s.moderation.appendSpeech({ ...base, commandId: "0" })).toBe(false);
    expect(await s.classroom.days(s.owner.account.id)).toEqual(["2026-09-10"]);
    const first = await s.classroom.speech(s.owner.account.id, { day: "2026-09-10", after: 0 });
    expect(first.records).toHaveLength(200);
    expect(first.hasMore).toBe(true);
    const last = await s.classroom.speech(s.owner.account.id, {
      day: "2026-09-10",
      after: first.records.at(-1)?.id ?? 0,
    });
    expect(last.records).toHaveLength(5);
    expect(last.hasMore).toBe(false);
    await s.classroom.prune();
    expect(await s.moderation.speechDays("1900-01-01T00:00:00.000Z")).toEqual(["2026-09-10"]);
  });
  it("serializes mutations and keeps working after an operation fails", async () => {
    const run = createOperationQueue();
    const calls: string[] = [];
    await Promise.allSettled([
      run(async () => {
        calls.push("first");
        throw new Error("test");
      }),
      run(async () => {
        calls.push("second");
      }),
    ]);
    expect(calls).toEqual(["first", "second"]);
  });
});
