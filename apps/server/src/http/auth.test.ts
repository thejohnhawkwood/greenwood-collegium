import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { SESSION_COOKIE } from "../auth/cookies.js";
import {
  completeTestCharacter,
  createTestAuth,
  TEST_BOOTSTRAP_TOKEN,
} from "../auth/test-harness.js";
import { applyInPlay, registerAuthRoutes } from "./auth.js";

describe("auth HTTP", () => {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it("bootstraps, reads the session cookie, and signs out", async () => {
    const { auth } = createTestAuth();
    app = await buildApp();
    await registerAuthRoutes(app, { auth, allowGuestPlay: false, secureCookies: false });

    const status = await app.inject({ method: "GET", url: "/auth/status" });
    expect(status.json()).toEqual({
      signedIn: false,
      allowGuestPlay: false,
      bootstrapOpen: true,
    });

    const boot = await app.inject({
      method: "POST",
      url: "/auth/bootstrap",
      payload: { token: TEST_BOOTSTRAP_TOKEN, username: "Rowan", password: "lantern-path" },
    });
    expect(boot.statusCode).toBe(200);
    expect(JSON.stringify(boot.json())).not.toContain("lantern-path");
    expect(JSON.stringify(boot.json())).not.toContain(TEST_BOOTSTRAP_TOKEN);
    expect(boot.json()).toMatchObject({
      username: "rowan",
      role: "owner",
      characterComplete: false,
    });
    expect(boot.json().characterName).toBeUndefined();
    const cookie = cookieValue(boot, SESSION_COOKIE);
    expect(boot.headers["set-cookie"]?.toString()).toContain("HttpOnly");

    const me = await app.inject({
      method: "GET",
      url: "/auth/me",
      cookies: { [SESSION_COOKIE]: cookie },
    });
    expect(me.statusCode).toBe(200);
    expect(me.json()).toMatchObject({ username: "rowan" });

    const out = await app.inject({
      method: "POST",
      url: "/auth/sign-out",
      cookies: { [SESSION_COOKIE]: cookie },
    });
    expect(out.statusCode).toBe(200);
    const after = await app.inject({
      method: "GET",
      url: "/auth/me",
      cookies: { [SESSION_COOKIE]: cookie },
    });
    expect(after.statusCode).toBe(401);
  });

  it("issues a socket ticket only to a signed-in session", async () => {
    const { auth } = createTestAuth();
    app = await buildApp();
    await registerAuthRoutes(app, { auth, allowGuestPlay: false, secureCookies: false });

    const denied = await app.inject({ method: "GET", url: "/auth/socket-ticket" });
    expect(denied.statusCode).toBe(401);

    const boot = await app.inject({
      method: "POST",
      url: "/auth/bootstrap",
      payload: { token: TEST_BOOTSTRAP_TOKEN, username: "Rowan", password: "lantern-path" },
    });
    const cookie = cookieValue(boot, SESSION_COOKIE);
    const before = await app.inject({
      method: "GET",
      url: "/auth/socket-ticket",
      cookies: { [SESSION_COOKIE]: cookie },
    });
    expect(before.statusCode).toBe(401);
    await completeTestCharacter(auth, String(boot.json().accountId));
    const issued = await app.inject({
      method: "GET",
      url: "/auth/socket-ticket",
      cookies: { [SESSION_COOKIE]: cookie },
    });
    expect(issued.statusCode).toBe(200);
    expect(issued.json()).toEqual({ ticket: expect.any(String) });
    expect(String(issued.json().ticket)).not.toBe(cookie);
  });

  it("lets a signed-in account finish a Collegian", async () => {
    const { auth } = createTestAuth();
    app = await buildApp();
    await registerAuthRoutes(app, { auth, allowGuestPlay: false, secureCookies: false });
    const boot = await app.inject({
      method: "POST",
      url: "/auth/bootstrap",
      payload: { token: TEST_BOOTSTRAP_TOKEN, username: "arbird", password: "lantern-path" },
    });
    const cookie = cookieValue(boot, SESSION_COOKIE);
    const options = await app.inject({
      method: "GET",
      url: "/auth/character-options",
      cookies: { [SESSION_COOKIE]: cookie },
    });
    expect(options.statusCode).toBe(200);
    expect(options.json().intro).toContain("Greenwood Collegium");
    const suggested = await app.inject({
      method: "POST",
      url: "/auth/suggested-name",
      cookies: { [SESSION_COOKIE]: cookie },
    });
    expect(suggested.statusCode).toBe(200);
    const created = await app.inject({
      method: "POST",
      url: "/auth/character",
      cookies: { [SESSION_COOKIE]: cookie },
      payload: { name: "Lumen", speciesId: "otter", gender: "female" },
    });
    expect(created.statusCode).toBe(200);
    expect(created.json()).toMatchObject({
      username: "arbird",
      characterComplete: true,
      characterName: "Lumen the Otter",
    });
  });

  it("issues an invite, accepts it, and blocks a disabled account", async () => {
    const { auth } = createTestAuth();
    app = await buildApp();
    await registerAuthRoutes(app, { auth, allowGuestPlay: false, secureCookies: true });

    const owner = await app.inject({
      method: "POST",
      url: "/auth/bootstrap",
      payload: { token: TEST_BOOTSTRAP_TOKEN, username: "owner", password: "lantern-path" },
    });
    const ownerCookie = cookieValue(owner, SESSION_COOKIE);

    const invite = await app.inject({
      method: "POST",
      url: "/auth/invites",
      cookies: { [SESSION_COOKIE]: ownerCookie },
      payload: { role: "student" },
    });
    expect(invite.statusCode).toBe(200);
    expect(owner.headers["set-cookie"]?.toString()).toContain("Secure");
    const token = (invite.json() as { token: string }).token;
    expect(token.length).toBeGreaterThan(20);

    const accepted = await app.inject({
      method: "POST",
      url: "/auth/accept-invite",
      payload: { token, username: "pip", password: "lantern-path" },
    });
    expect(accepted.statusCode).toBe(200);
    const student = accepted.json() as { accountId: string };
    const studentCookie = cookieValue(accepted, SESSION_COOKIE);

    const disabled = await app.inject({
      method: "POST",
      url: "/auth/disable",
      cookies: { [SESSION_COOKIE]: ownerCookie },
      payload: { accountId: student.accountId },
    });
    expect(disabled.statusCode).toBe(200);
    expect(
      (
        await app.inject({
          method: "GET",
          url: "/auth/me",
          cookies: { [SESSION_COOKIE]: studentCookie },
        })
      ).statusCode,
    ).toBe(401);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/auth/sign-in",
          payload: { username: "pip", password: "lantern-path" },
        })
      ).json(),
    ).toMatchObject({ error: "account_disabled" });
  });

  it("lets the owner read unused tokens and accepted usernames", async () => {
    const { auth } = createTestAuth();
    app = await buildApp();
    await registerAuthRoutes(app, {
      auth,
      allowGuestPlay: false,
      secureCookies: false,
      persistence: "memory",
    });

    const owner = await app.inject({
      method: "POST",
      url: "/auth/bootstrap",
      payload: { token: TEST_BOOTSTRAP_TOKEN, username: "owner", password: "lantern-path" },
    });
    const ownerCookie = cookieValue(owner, SESSION_COOKIE);

    const invite = await app.inject({
      method: "POST",
      url: "/auth/invites",
      cookies: { [SESSION_COOKIE]: ownerCookie },
      payload: { role: "student" },
    });
    const token = (invite.json() as { token: string }).token;

    const unused = await app.inject({
      method: "GET",
      url: "/auth/classroom",
      cookies: { [SESSION_COOKIE]: ownerCookie },
    });
    expect(unused.statusCode).toBe(200);
    expect(unused.json()).toMatchObject({
      persistence: "memory",
      invites: [{ status: "unused", token, role: "student" }],
      accounts: [{ username: "owner", role: "teacher" }],
    });

    const accepted = await app.inject({
      method: "POST",
      url: "/auth/accept-invite",
      payload: { token: `  ${token}  `, username: "pip", password: "lantern-path" },
    });
    expect(accepted.statusCode).toBe(200);
    const studentCookie = cookieValue(accepted, SESSION_COOKIE);

    const used = await app.inject({
      method: "GET",
      url: "/auth/classroom",
      cookies: { [SESSION_COOKIE]: ownerCookie },
    });
    expect(used.json()).toMatchObject({
      persistence: "memory",
      invites: [{ status: "used", username: "pip", token }],
      accounts: expect.arrayContaining([
        expect.objectContaining({ username: "pip", role: "student", inPlay: false }),
        expect.objectContaining({ username: "owner", role: "teacher" }),
      ]),
    });
    expect(JSON.stringify(used.json())).toContain(token);
    expect(JSON.stringify(used.json())).not.toContain("lantern-path");

    expect(
      (
        await app.inject({
          method: "GET",
          url: "/auth/classroom",
          cookies: { [SESSION_COOKIE]: studentCookie },
        })
      ).statusCode,
    ).toBe(403);
    expect(
      (
        await app.inject({
          method: "POST",
          url: "/auth/sign-in",
          payload: { username: "owner", password: "lantern-path", audience: "student" },
        })
      ).json(),
    ).toMatchObject({ message: "Use the teacher sign-in below." });
  });

  it("marks only live courtyard seats as in play", () => {
    expect(
      applyInPlay(
        [
          {
            accountId: "acct-live",
            characterId: "char-live",
            roomId: "lantern-court",
            roomTitle: "Lantern Court",
          },
          { accountId: "acct-away", characterId: "char-away" },
        ],
        [
          {
            characterId: "char-live",
            accountId: "acct-live",
            roomId: "great-hall",
            roomTitle: "Great Hall",
          },
        ],
      ),
    ).toEqual([
      {
        accountId: "acct-live",
        characterId: "char-live",
        inPlay: true,
        roomId: "great-hall",
        roomTitle: "Great Hall",
      },
      { accountId: "acct-away", characterId: "char-away", inPlay: false },
    ]);
  });
});

function cookieValue(
  response: { cookies: Array<{ name: string; value: string }> },
  name: string,
): string {
  const found = response.cookies.find((cookie) => cookie.name === name);
  if (!found) {
    throw new Error(`missing cookie ${name}`);
  }
  return found.value;
}
