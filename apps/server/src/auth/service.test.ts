import { describe, expect, it } from "vitest";
import { argon2Hasher } from "./hasher.js";
import { createAuthService, SOCKET_TICKET_TTL_MS } from "./service.js";
import { completeTestCharacter, createTestAuth, TEST_BOOTSTRAP_TOKEN } from "./test-harness.js";

describe("classroom auth service", () => {
  it("bootstraps an owner, then signs in and out", async () => {
    const { auth } = createTestAuth();
    expect(await auth.bootstrapOpen()).toBe(true);
    const created = await auth.bootstrap({
      token: TEST_BOOTSTRAP_TOKEN,
      username: "Rowan",
      password: "lantern-path",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    expect(created.account.role).toBe("owner");
    expect(created.character).toBeUndefined();
    await completeTestCharacter(auth, created.account.id);
    expect(await auth.resolvePlayIdentity(created.sessionToken)).toMatchObject({
      characterName: "Rowan the Hare",
    });
    expect(await auth.bootstrapOpen()).toBe(false);
    expect(
      await auth.bootstrap({
        token: TEST_BOOTSTRAP_TOKEN,
        username: "Moss",
        password: "lantern-path",
      }),
    ).toMatchObject({ ok: false, code: "owner_exists" });

    await auth.signOut(created.sessionToken);
    expect(await auth.resolveSession(created.sessionToken)).toBeUndefined();

    const signedIn = await auth.signIn({ username: "ROWAN", password: "lantern-path" });
    expect(signedIn.ok).toBe(true);
    expect(await auth.signIn({ username: "rowan", password: "wrong-password" })).toMatchObject({
      ok: false,
      code: "invalid_credentials",
    });
  });

  it("lets an owner invite a student and rejects a used or disabled path", async () => {
    const { auth } = createTestAuth();
    const owner = await auth.bootstrap({
      token: TEST_BOOTSTRAP_TOKEN,
      username: "owner",
      password: "lantern-path",
    });
    expect(owner.ok).toBe(true);
    if (!owner.ok) {
      return;
    }

    const invite = await auth.createInvite(owner.account.id, "student");
    expect(invite.ok).toBe(true);
    if (!invite.ok) {
      return;
    }

    const student = await auth.acceptInvite({
      token: invite.token,
      username: "pip",
      password: "lantern-path",
    });
    expect(student.ok).toBe(true);
    if (!student.ok) {
      return;
    }
    expect(student.account.role).toBe("student");
    expect(
      await auth.acceptInvite({ token: invite.token, username: "ash", password: "lantern-path" }),
    ).toMatchObject({
      ok: false,
      code: "invalid_invite",
    });
    expect(await auth.createInvite(student.account.id, "student")).toMatchObject({
      ok: false,
      code: "forbidden",
    });

    expect(await auth.disableAccount(owner.account.id, student.account.id)).toEqual({ ok: true });
    expect(await auth.resolveSession(student.sessionToken)).toBeUndefined();
    expect(await auth.signIn({ username: "pip", password: "lantern-path" })).toMatchObject({
      ok: false,
      code: "account_disabled",
    });
    expect(await auth.disableAccount(owner.account.id, owner.account.id)).toMatchObject({
      ok: false,
      code: "forbidden",
    });
  });

  it("keeps unused invite tokens on the teacher roster and hides them after accept", async () => {
    const { auth } = createTestAuth();
    const owner = await auth.bootstrap({
      token: TEST_BOOTSTRAP_TOKEN,
      username: "owner",
      password: "lantern-path",
    });
    expect(owner.ok).toBe(true);
    if (!owner.ok) {
      return;
    }

    const invite = await auth.createInvite(owner.account.id, "student");
    expect(invite.ok).toBe(true);
    if (!invite.ok) {
      return;
    }

    const roster = await auth.listClassroom(owner.account.id);
    expect(roster.ok).toBe(true);
    if (!roster.ok) {
      return;
    }
    expect(roster.invites).toEqual([
      expect.objectContaining({
        status: "unused",
        token: invite.token,
        role: "student",
      }),
    ]);

    const student = await auth.acceptInvite({
      token: `  ${invite.token}  `,
      username: "pip",
      password: "lantern-path",
    });
    expect(student.ok).toBe(true);
    if (!student.ok) {
      return;
    }

    const after = await auth.listClassroom(owner.account.id);
    expect(after.ok).toBe(true);
    if (!after.ok) {
      return;
    }
    expect(after.invites[0]).toMatchObject({
      status: "used",
      username: "pip",
    });
    expect(after.invites[0]?.token).toBeUndefined();
    expect(after.accounts).toEqual([
      expect.objectContaining({ username: "pip", role: "student", status: "active" }),
    ]);
    await completeTestCharacter(auth, student.account.id, {
      name: "Pip",
      speciesId: "squirrel",
      gender: "female",
    });
    const named = await auth.listClassroom(owner.account.id);
    expect(named.ok).toBe(true);
    if (named.ok) {
      expect(named.accounts[0]).toMatchObject({
        username: "pip",
        characterName: "Pip the Squirrel",
      });
    }
    expect(await auth.listClassroom(student.account.id)).toMatchObject({
      ok: false,
      code: "forbidden",
    });
  });

  it("issues several unused student tokens at once", async () => {
    const { auth } = createTestAuth();
    const owner = await auth.bootstrap({
      token: TEST_BOOTSTRAP_TOKEN,
      username: "owner",
      password: "lantern-path",
    });
    expect(owner.ok).toBe(true);
    if (!owner.ok) {
      return;
    }
    const batch = await auth.createInvite(owner.account.id, "student", 3);
    expect(batch.ok).toBe(true);
    if (!batch.ok) {
      return;
    }
    expect(batch.tokens).toHaveLength(3);
    expect(new Set(batch.tokens).size).toBe(3);
    const roster = await auth.listClassroom(owner.account.id);
    expect(roster.ok).toBe(true);
    if (roster.ok) {
      expect(roster.invites.filter((invite) => invite.status === "unused")).toHaveLength(3);
    }
  });

  it("sends owner and teacher to the staff sign-in", async () => {
    const { auth } = createTestAuth();
    const owner = await auth.bootstrap({
      token: TEST_BOOTSTRAP_TOKEN,
      username: "owner",
      password: "lantern-path",
    });
    expect(owner.ok).toBe(true);
    if (!owner.ok) {
      return;
    }
    expect(
      await auth.signIn({ username: "owner", password: "lantern-path", audience: "student" }),
    ).toMatchObject({
      ok: false,
      code: "invalid_credentials",
      message: "Use the teacher sign-in below.",
    });
    expect(
      await auth.signIn({ username: "owner", password: "lantern-path", audience: "staff" }),
    ).toMatchObject({ ok: true });

    const invite = await auth.createInvite(owner.account.id, "student");
    expect(invite.ok).toBe(true);
    if (!invite.ok) {
      return;
    }
    await auth.acceptInvite({
      token: invite.token,
      username: "pip",
      password: "lantern-path",
    });
    expect(
      await auth.signIn({ username: "pip", password: "lantern-path", audience: "staff" }),
    ).toMatchObject({
      ok: false,
      code: "invalid_credentials",
      message: "Use the student sign-in above.",
    });
  });

  it("accepts a bootstrap token with surrounding whitespace", async () => {
    const { auth } = createTestAuth();
    const created = await auth.bootstrap({
      token: `  ${TEST_BOOTSTRAP_TOKEN}  `,
      username: "rowan",
      password: "lantern-path",
    });
    expect(created.ok).toBe(true);
  });

  it("creates a Collegian that is not the username and can roll a name", async () => {
    const { auth } = createTestAuth();
    const owner = await auth.bootstrap({
      token: TEST_BOOTSTRAP_TOKEN,
      username: "arbird",
      password: "lantern-path",
    });
    expect(owner.ok).toBe(true);
    if (!owner.ok) {
      return;
    }
    expect(await auth.issueSocketTicket(owner.account.id)).toBeUndefined();
    expect(
      await auth.completeCharacter(owner.account.id, {
        name: "Porter",
        speciesId: "hare",
        gender: "male",
      }),
    ).toMatchObject({
      ok: false,
      code: "invalid_character_name",
    });
    const created = await auth.completeCharacter(owner.account.id, {
      name: "lumen",
      speciesId: "otter",
      gender: "female",
    });
    expect(created).toMatchObject({ ok: true });
    if (!created.ok) {
      return;
    }
    expect(created.character.name).toBe("Lumen");
    expect(await auth.resolvePlayIdentity(owner.sessionToken)).toMatchObject({
      characterName: "Lumen the Otter",
    });
    expect(auth.characterOptions().intro).toContain("Greenwood Collegium");
    const suggested = await auth.suggestCharacterName();
    expect(suggested).toEqual(expect.any(String));
    expect(suggested?.toLowerCase()).not.toBe("arbird");
  });

  it("issues a hashed socket ticket that expires", async () => {
    let nowMs = Date.parse("2026-09-07T12:00:00.000Z");
    const { auth } = createTestAuth(() => new Date(nowMs));
    const owner = await auth.bootstrap({
      token: TEST_BOOTSTRAP_TOKEN,
      username: "owner",
      password: "lantern-path",
    });
    expect(owner.ok).toBe(true);
    if (!owner.ok) {
      return;
    }
    await completeTestCharacter(auth, owner.account.id);
    const ticket = await auth.issueSocketTicket(owner.account.id);
    expect(ticket).toEqual(expect.any(String));
    expect(await auth.resolveSocketTicket(ticket ?? "")).toMatchObject({
      accountId: owner.account.id,
      characterName: "Rowan the Hare",
    });
    expect(await auth.resolveSocketTicket("not-a-ticket")).toBeUndefined();
    nowMs += SOCKET_TICKET_TTL_MS + 1;
    expect(await auth.resolveSocketTicket(ticket ?? "")).toBeUndefined();
  });

  it("rejects a wrong bootstrap token without creating an owner", async () => {
    const { auth } = createTestAuth();
    expect(
      await auth.bootstrap({ token: "nope", username: "rowan", password: "lantern-path" }),
    ).toMatchObject({ ok: false, code: "invalid_bootstrap" });
    expect(await auth.bootstrapOpen()).toBe(true);
  });
});

describe("argon2 hasher", () => {
  it("hashes and verifies with Argon2id", async () => {
    const hashed = await argon2Hasher.hash("classroom-pass");
    expect(hashed).toContain("argon2id");
    expect(await argon2Hasher.verify(hashed, "classroom-pass")).toBe(true);
    expect(await argon2Hasher.verify(hashed, "wrong-password")).toBe(false);
  });
});

describe("createAuthService wiring", () => {
  it("does not bootstrap when the env token is missing", async () => {
    const { createMemoryStores } = await import("../persistence/memory.js");
    const { testHasher } = await import("./hasher.js");
    const stores = createMemoryStores();
    const auth = createAuthService({
      ...stores,
      hasher: testHasher,
      bootstrapToken: undefined,
    });
    expect(
      await auth.bootstrap({ token: "anything-long", username: "rowan", password: "lantern-path" }),
    ).toMatchObject({ ok: false, code: "invalid_bootstrap" });
  });
});
