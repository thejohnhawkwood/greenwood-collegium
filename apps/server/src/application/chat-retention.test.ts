import { afterEach, describe, expect, it } from "vitest";
import { chatRetentionCutoff } from "./chat-retention.js";

describe("chatRetentionCutoff", () => {
  const previous = process.env.CHAT_RETENTION_DAYS;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.CHAT_RETENTION_DAYS;
    } else {
      process.env.CHAT_RETENTION_DAYS = previous;
    }
  });

  it("uses 30 days when the env is unset", () => {
    delete process.env.CHAT_RETENTION_DAYS;
    const now = new Date("2026-09-09T16:00:00.000Z");
    expect(chatRetentionCutoff(now).toISOString()).toBe("2026-08-10T16:00:00.000Z");
  });
});
