import { describe, expect, it } from "vitest";
import { parseInviteCount } from "./invite-count.js";

describe("invite count", () => {
  it("clamps a typed student count to the classroom maximum", () => {
    expect(parseInviteCount("24", 200, 8)).toBe(24);
    expect(parseInviteCount("0", 200, 8)).toBe(1);
    expect(parseInviteCount("300", 200, 8)).toBe(200);
    expect(parseInviteCount("", 200, 8)).toBe(8);
    expect(parseInviteCount("nope", 200, 8)).toBe(8);
  });
});
