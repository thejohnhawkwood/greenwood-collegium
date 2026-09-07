import { describe, expect, it } from "vitest";
import {
  applyProcessHello,
  readStoredBootId,
  readStoredSequence,
  shouldApplyEvent,
  shouldResyncAfterAck,
  writeStoredBootId,
  writeStoredSequence,
} from "./event-sequence.js";

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

  it("resets the sequence when the process boot id changes", () => {
    expect(applyProcessHello("boot-old", "boot-new", 50)).toEqual({
      bootId: "boot-new",
      lastSequence: 0,
      reset: true,
    });
    expect(applyProcessHello("boot-same", "boot-same", 50)).toEqual({
      bootId: "boot-same",
      lastSequence: 50,
      reset: false,
    });
    expect(applyProcessHello(null, "boot-first", 50)).toEqual({
      bootId: "boot-first",
      lastSequence: 0,
      reset: true,
    });
    const storage = new Map<string, string>();
    const store = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
    };
    writeStoredBootId(store, "boot-lantern");
    expect(readStoredBootId(store)).toBe("boot-lantern");
  });

  it("resyncs after an accepted command whose events are older than the stored sequence", () => {
    expect(shouldResyncAfterAck(50, 2)).toBe(true);
    expect(shouldResyncAfterAck(5, 5)).toBe(false);
    expect(shouldResyncAfterAck(4, 5)).toBe(false);
    expect(shouldResyncAfterAck(50, undefined)).toBe(false);
  });
});
