import { describe, expect, it } from "vitest";
import { handleJoin, handleLeave } from "./presence.js";
import type { EngineRuntime, WorldState } from "./state.js";

function emptyCourt(): WorldState {
  return {
    rooms: {
      "lantern-court": {
        id: "lantern-court",
        title: "Lantern Court",
        shortDescription: "A courtyard.",
        longDescription: "Blue lanterns drift.",
        zone: "academy-core",
        exits: [],
        fixtures: [],
      },
    },
    characters: {},
  };
}

function runtime(): EngineRuntime {
  let sequence = 0;
  return {
    now: () => new Date("2026-09-03T21:00:00.000Z"),
    nextEventId: () => "evt-presence",
    nextSequence: () => (sequence += 1),
  };
}

describe("presence", () => {
  it("joins a room, announces to occupants, and leaves cleanly", () => {
    const world = emptyCourt();
    const clock = runtime();
    const first = handleJoin(
      world,
      { verb: "join", characterId: "char-rowan", name: "Rowan the Hare", roomId: "lantern-court" },
      clock,
    );
    expect(first.ok).toBe(true);
    if (first.ok) {
      expect(first.events[0]?.payload.title).toBe("Lantern Court");
      expect(first.notices).toHaveLength(0);
    }

    const second = handleJoin(
      world,
      { verb: "join", characterId: "char-moss", name: "Moss the Mole", roomId: "lantern-court" },
      clock,
    );
    expect(second.ok).toBe(true);
    if (second.ok) {
      expect(second.notices[0]?.characterId).toBe("char-rowan");
      expect(second.notices[0]?.event.narration).toBe("Moss the Mole arrives.");
    }

    const left = handleLeave(world, { verb: "leave", characterId: "char-moss" }, clock);
    expect(left.ok).toBe(true);
    if (left.ok) {
      expect(left.notices[0]?.event.narration).toBe("Moss the Mole has left.");
    }
    expect(world.characters["char-moss"]).toBeUndefined();
    expect(world.characters["char-rowan"]).toBeDefined();
  });
});
