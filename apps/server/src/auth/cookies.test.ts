import { describe, expect, it } from "vitest";
import { expiredSessionCookie, parseCookie, SESSION_COOKIE, sessionCookie } from "./cookies.js";

describe("session cookies", () => {
  it("parses and formats an HttpOnly session cookie", () => {
    const header = sessionCookie("abc+def", { secure: true, maxAgeSec: 60 });
    expect(header).toContain("HttpOnly");
    expect(header).toContain("Secure");
    expect(header).toContain("SameSite=Lax");
    expect(parseCookie(`${SESSION_COOKIE}=abc%2Bdef; Path=/`, SESSION_COOKIE)).toBe("abc+def");
    expect(expiredSessionCookie(false)).toContain("Max-Age=0");
  });
});
