import { describe, expect, it } from "vitest";
import { readStoredSequence, shouldApplyEvent, writeStoredSequence } from "./event-sequence.js";

describe("event sequence", () => {
  it("ignores already-applied events and stores the latest sequence", () => {
    expect(shouldApplyEvent(3, 3)).toBe(false);
    expect(shouldApplyEvent(3, 4)).toBe(true);
    const storage = new Map<string, string>();
    const store = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
    };
    writeStoredSequence(store, "char-rowan", 7);
    expect(readStoredSequence(store, "char-rowan")).toBe(7);
  });
});
