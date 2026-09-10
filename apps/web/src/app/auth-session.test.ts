import { describe, expect, it } from "vitest";
import { loadAuthSession } from "./auth-session.js";

describe("approval session refresh", () => {
  it("distinguishes an expired session from a temporary network failure", async () => {
    const status = { signedIn: true, allowGuestPlay: false, bootstrapOpen: false };
    const expired = await loadAuthSession(async (path) =>
      path === "/auth/status" ? Response.json(status) : new Response(null, { status: 401 }),
    );
    expect(expired.status.signedIn).toBe(false);
    expect(expired.me).toBeUndefined();
    await expect(
      loadAuthSession(async () => {
        throw new Error("offline");
      }),
    ).rejects.toThrow("offline");
    await expect(
      loadAuthSession(async (path) =>
        path === "/auth/status" ? Response.json(status) : new Response(null, { status: 503 }),
      ),
    ).rejects.toThrow("Session check unavailable");
  });
  it("returns validated server approval and timeout state and rejects malformed sessions", async () => {
    const status = { signedIn: true, allowGuestPlay: false, bootstrapOpen: false };
    const me = {
      accountId: "fictional",
      username: "pupil",
      role: "student",
      characterComplete: true,
      nameReview: { status: "pending" },
      timeoutUntil: "2026-09-10T18:10:00.000Z",
    };
    expect(
      (await loadAuthSession(async (path) => Response.json(path === "/auth/status" ? status : me)))
        .me,
    ).toMatchObject(me);
    await expect(
      loadAuthSession(async (path) =>
        Response.json(path === "/auth/status" ? status : { role: "admin" }),
      ),
    ).rejects.toThrow();
  });
});
