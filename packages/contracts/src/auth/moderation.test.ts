import { describe, expect, it } from "vitest";
import { moderationActionSchema, resetRequestSchema, speechQuerySchema } from "./moderation.js";
describe("moderation request boundaries", () => {
  it("requires an exact review revision and feedback for rejection", () => {
    expect(
      moderationActionSchema.safeParse({ action: "approve", accountId: "fixture" }).success,
    ).toBe(false);
    expect(
      moderationActionSchema.safeParse({
        action: "reject",
        accountId: "fixture",
        revision: "r",
        reason: " ",
      }).success,
    ).toBe(false);
  });
  it("bounds durations and rejects unknown actions", () => {
    for (const minutes of [-1, 0, 1.2, 10081])
      expect(
        moderationActionSchema.safeParse({ action: "mute", accountId: "fixture", minutes }).success,
      ).toBe(false);
    expect(
      moderationActionSchema.safeParse({ action: "promote-owner", accountId: "fixture" }).success,
    ).toBe(false);
  });
  it("requires explicit reset wording and validates pagination", () => {
    expect(resetRequestSchema.safeParse({ revision: "r", confirmation: "yes" }).success).toBe(
      false,
    );
    expect(
      resetRequestSchema.safeParse({ revision: "r", confirmation: "RESET STUDENTS" }).success,
    ).toBe(true);
    expect(speechQuerySchema.safeParse({ day: "2026-09-10", after: "-1" }).success).toBe(false);
    expect(speechQuerySchema.safeParse({ day: "2026-09-10", after: "200" }).success).toBe(true);
  });
});
