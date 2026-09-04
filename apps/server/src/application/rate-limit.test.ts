import { describe, expect, it } from "vitest";
import { RateLimiter } from "./rate-limit.js";

describe("RateLimiter", () => {
  it("allows a burst then blocks inside the window", () => {
    let now = 1_000;
    const limiter = new RateLimiter(() => now);
    expect(limiter.allow("say:char-rowan", 2, 1_000)).toBe(true);
    expect(limiter.allow("say:char-rowan", 2, 1_000)).toBe(true);
    expect(limiter.allow("say:char-rowan", 2, 1_000)).toBe(false);
    now = 2_100;
    expect(limiter.allow("say:char-rowan", 2, 1_000)).toBe(true);
  });
});
