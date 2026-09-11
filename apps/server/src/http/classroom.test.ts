import Fastify from "fastify";
import { afterEach, describe, expect, it } from "vitest";
import { createTestAuth } from "../auth/test-harness.js";
import { SESSION_COOKIE } from "../auth/cookies.js";
import { createClassroomService } from "../application/classroom.js";
import { createOperationQueue } from "../application/operation-queue.js";
import { registerAuthRoutes } from "./auth.js";
import { registerClassroomRoutes } from "./classroom.js";

describe("classroom HTTP boundaries", () => {
  const apps: ReturnType<typeof Fastify>[] = [];
  afterEach(async () => {
    for (const app of apps.splice(0)) await app.close();
  });
  async function setup() {
    const stores = createTestAuth();
    const classroom = createClassroomService(stores);
    const runExclusive = createOperationQueue();
    const app = Fastify({ logger: false });
    apps.push(app);
    await registerAuthRoutes(app, {
      auth: stores.auth,
      allowGuestPlay: false,
      secureCookies: false,
      runExclusive,
      chatPaused: () => stores.moderation.chatPaused(),
    });
    await registerClassroomRoutes(app, { auth: stores.auth, classroom, runExclusive });
    const owner = await stores.auth.bootstrap({
      token: stores.bootstrapToken,
      username: "teacher",
      password: "fictional-password",
    });
    if (!owner.ok) throw new Error(owner.message);
    const batch = await stores.auth.createInvite(owner.account.id, "student", 30);
    if (!batch.ok) throw new Error(batch.message);
    const student = await stores.auth.acceptInvite({
      token: batch.token,
      username: "pupil",
      password: "fictional-password",
    });
    if (!student.ok) throw new Error(student.message);
    const staffCookie = { [SESSION_COOKIE]: owner.sessionToken };
    const studentCookie = { [SESSION_COOKIE]: student.sessionToken };
    return { ...stores, app, classroom, owner, student, batch, staffCookie, studentCookie };
  }
  it("denies student and unauthenticated reads and mutations, including exports", async () => {
    const s = await setup();
    for (const url of [
      "/admin/speech/days",
      "/admin/speech?day=2026-09-10",
      "/admin/speech/export?day=2026-09-10",
      "/admin/reset-preview",
      "/admin/audit",
    ]) {
      expect((await s.app.inject({ url })).statusCode).toBe(401);
      expect((await s.app.inject({ url, cookies: s.studentCookie })).statusCode).toBe(403);
    }
    expect(
      (
        await s.app.inject({
          method: "POST",
          url: "/admin/action",
          cookies: s.studentCookie,
          payload: { action: "chat-pause", paused: true },
        })
      ).statusCode,
    ).toBe(403);
    expect(
      (await s.app.inject({ url: "/admin/speech/days", cookies: s.staffCookie })).headers[
        "cache-control"
      ],
    ).toBe("no-store");
  });
  it("accepts pending names without issuing a play ticket, then allows a reviewed revision", async () => {
    const s = await setup();
    const created = await s.app.inject({
      method: "POST",
      url: "/auth/character",
      cookies: s.studentCookie,
      payload: { username: "pupil", name: "Hazel", speciesId: "mouse", gender: "female" },
    });
    expect(created.json()).toMatchObject({
      characterComplete: true,
      nameReview: { status: "pending" },
    });
    expect(
      (await s.app.inject({ url: "/auth/socket-ticket", cookies: s.studentCookie })).statusCode,
    ).toBe(401);
    const reviewed = await s.app.inject({
      method: "POST",
      url: "/admin/action",
      cookies: s.staffCookie,
      payload: {
        action: "approve",
        accountId: s.student.account.id,
        revision: created.json().nameReview.revision,
      },
    });
    expect(reviewed.statusCode).toBe(200);
    expect(
      (await s.app.inject({ url: "/auth/socket-ticket", cookies: s.studentCookie })).statusCode,
    ).toBe(200);
    const roster = await s.app.inject({ url: "/auth/classroom", cookies: s.staffCookie });
    expect(roster.json().accounts[0]).toMatchObject({
      nameReview: { status: "approved" },
      inviteReference: expect.any(String),
      characterId: expect.any(String),
      roomId: "lantern-court",
      roomTitle: "Lantern Court",
    });
    const renamed = await s.app.inject({
      method: "POST",
      url: "/admin/action",
      cookies: s.staffCookie,
      payload: { action: "rename-character", accountId: s.student.account.id, name: "Fern" },
    });
    expect(renamed.statusCode).toBe(200);
    const afterRename = await s.app.inject({ url: "/auth/classroom", cookies: s.staffCookie });
    expect(afterRename.json().accounts[0]).toMatchObject({
      characterName: "Fern the Mouse",
      nameReview: { status: "approved" },
    });
    expect(roster.body).not.toContain("fictional-password");
  });
  it("requires the exact reset confirmation and provides a private plain-text daily export", async () => {
    const s = await setup();
    await s.moderation.appendSpeech({
      commandId: "message",
      accountId: s.student.account.id,
      characterId: "fictional-character",
      occurredAt: new Date().toISOString(),
      day: "2026-09-10",
      username: "pupil",
      characterName: "Hazel",
      roomId: "great-hall",
      text: "<script>Fictional text stays text</script>",
      inviteReference: "reference",
    });
    const exported = await s.app.inject({
      url: "/admin/speech/export?day=2026-09-10",
      cookies: s.staffCookie,
    });
    expect(exported.statusCode).toBe(200);
    expect(exported.headers["content-type"]).toContain("text/plain");
    expect(exported.headers["content-disposition"]).toContain("attachment");
    expect(exported.body).toContain("great-hall");
    expect(exported.body).toContain("Fictional text stays text");
    const preview = await s.app.inject({ url: "/admin/reset-preview", cookies: s.staffCookie });
    expect(
      (
        await s.app.inject({
          method: "POST",
          url: "/admin/reset",
          cookies: s.staffCookie,
          payload: { revision: preview.json().revision, confirmation: "yes" },
        })
      ).statusCode,
    ).toBe(400);
    expect(
      (
        await s.app.inject({
          method: "POST",
          url: "/admin/reset",
          cookies: s.staffCookie,
          payload: { revision: preview.json().revision, confirmation: "RESET STUDENTS" },
        })
      ).statusCode,
    ).toBe(200);
    expect((await s.app.inject({ url: "/auth/me", cookies: s.staffCookie })).statusCode).toBe(200);
    expect((await s.app.inject({ url: "/auth/me", cookies: s.studentCookie })).statusCode).toBe(
      401,
    );
    expect(
      (await s.app.inject({ url: "/admin/speech/export?day=2026-09-10", cookies: s.staffCookie }))
        .body,
    ).toContain("Fictional text stays text");
  });
  it("allows a classroom of distinct registrations from one IP while throttling repeated guesses", async () => {
    const s = await setup();
    for (const [i, token] of s.batch.tokens.slice(1).entries()) {
      const response = await s.app.inject({
        method: "POST",
        url: "/auth/accept-invite",
        payload: { token, username: `pupil${i}`, password: "fictional-password" },
      });
      expect(response.statusCode).toBe(200);
      const cookie = response.cookies.find((row) => row.name === SESSION_COOKIE);
      if (!cookie) throw new Error("Expected synthetic session cookie");
      expect(
        (
          await s.app.inject({
            method: "POST",
            url: "/auth/suggested-name",
            cookies: { [SESSION_COOKIE]: cookie.value },
            payload: {},
          })
        ).statusCode,
      ).toBe(200);
    }
    for (let i = 0; i < 5; i++)
      expect(
        (
          await s.app.inject({
            method: "POST",
            url: "/auth/sign-in",
            payload: { username: "pupil", password: "wrong" },
          })
        ).statusCode,
      ).toBe(401);
    expect(
      (
        await s.app.inject({
          method: "POST",
          url: "/auth/sign-in",
          payload: { username: "pupil", password: "wrong" },
        })
      ).statusCode,
    ).toBe(429);
  });
});
