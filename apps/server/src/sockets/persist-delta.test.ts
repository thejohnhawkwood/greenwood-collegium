import { describe, expect, it } from "vitest";
import { changedProgress, persistDeltaIsQuiet, type ProgressStamp } from "./persist-delta.js";

function stamp(overrides: Partial<ProgressStamp> = {}): ProgressStamp {
  return {
    roomId: "lantern-court",
    discovered: "lantern-court",
    experience: 0,
    level: 1,
    schoolId: "",
    defeated: "",
    equipment: "{}",
    primer: "[]",
    quests: new Map(),
    ...overrides,
  };
}

describe("changed progress", () => {
  it("writes nothing when a look leaves the character alone", () => {
    const delta = changedProgress(stamp(), stamp());
    expect(persistDeltaIsQuiet(delta)).toBe(true);
  });

  it("writes the room on a step, and discovery only when a room is new", () => {
    const before = stamp();
    const moved = changedProgress(before, stamp({ roomId: "great-hall" }));
    expect(moved.room).toBe(true);
    expect(moved.discovery).toBe(false);
    expect(moved.progress).toBe(false);
    expect(moved.questIds).toEqual([]);

    const found = changedProgress(
      before,
      stamp({ roomId: "great-hall", discovered: "lantern-court,great-hall" }),
    );
    expect(found.room).toBe(true);
    expect(found.discovery).toBe(true);
  });

  it("writes only the quest that moved", () => {
    const before = stamp({
      quests: new Map([["arrival-at-the-collegium", "active|look|0|"]]),
    });
    const after = stamp({
      quests: new Map([["arrival-at-the-collegium", "active|look,say|0|"]]),
    });
    expect(changedProgress(before, after).questIds).toEqual(["arrival-at-the-collegium"]);
  });
});
