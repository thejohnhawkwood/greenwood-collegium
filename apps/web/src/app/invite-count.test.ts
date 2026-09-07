import { describe, expect, it } from "vitest";
import { parseInviteCount } from "./invite-count.js";

describe("invite count", () => {
  it("clamps a typed student count to the classroom maximum", () => {
    expect(parseInviteCount("24", 30, 8)).toBe(24);
    expect(parseInviteCount("0", 30, 8)).toBe(1);
    expect(parseInviteCount("99", 30, 8)).toBe(30);
    expect(parseInviteCount("", 30, 8)).toBe(8);
    expect(parseInviteCount("nope", 30, 8)).toBe(8);
  });
});
