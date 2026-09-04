import { describe, expect, it } from "vitest";
import { argon2Hasher } from "./hasher.js";
import { createAuthService } from "./service.js";
import { createTestAuth, TEST_BOOTSTRAP_TOKEN } from "./test-harness.js";

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
    expect(created.character.name).toBe("Rowan");
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
