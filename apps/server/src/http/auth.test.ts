import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { SESSION_COOKIE } from "../auth/cookies.js";
import { createTestAuth, TEST_BOOTSTRAP_TOKEN } from "../auth/test-harness.js";
import { registerAuthRoutes } from "./auth.js";

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
    expect(boot.json()).toMatchObject({ username: "rowan", role: "owner", characterName: "Rowan" });
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
