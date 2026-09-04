import { describe, expect, it } from "vitest";
import { handleSay } from "./say.js";
import type { EngineRuntime, WorldState } from "./state.js";

function courtWithTwo(): WorldState {
  return {
    rooms: {
      "lantern-court": {
        id: "lantern-court",
        title: "Lantern Court",
        shortDescription: "A circular courtyard under drifting blue lanterns.",
        longDescription: "Blue lanterns drift between the leaves.",
        zone: "academy-core",
        exits: [],
        fixtures: [],
      },
    },
    characters: {
      "char-rowan": {
        id: "char-rowan",
        name: "Rowan the Hare",
        roomId: "lantern-court",
        discoveredRoomIds: ["lantern-court"],
      },
      "char-moss": {
        id: "char-moss",
        name: "Moss the Mole",
        roomId: "lantern-court",
        discoveredRoomIds: ["lantern-court"],
      },
    },
  };
}

function runtime(): EngineRuntime {
  let sequence = 0;
  return {
    now: () => new Date("2026-09-03T21:00:00.000Z"),
    nextEventId: () => "evt-say",
    nextSequence: () => (sequence += 1),
  };
}

describe("handleSay", () => {
  it("tells the speaker and the other occupant different lines", () => {
    const result = handleSay(
      courtWithTwo(),
      { verb: "say", characterId: "char-rowan", text: "Meet me in the library." },
      runtime(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.events[0]?.narration).toBe('You say, "Meet me in the library."');
    expect(result.notices[0]?.characterId).toBe("char-moss");
    expect(result.notices[0]?.event.narration).toBe(
      'Rowan the Hare says, "Meet me in the library."',
    );
  });

  it("rejects empty and oversized speech", () => {
    const world = courtWithTwo();
    const empty = handleSay(
      world,
      { verb: "say", characterId: "char-rowan", text: "   " },
      runtime(),
    );
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.code).toBe("empty_say");
    }
    const oversized = handleSay(
      world,
      { verb: "say", characterId: "char-rowan", text: "x".repeat(161) },
      runtime(),
    );
    expect(oversized.ok).toBe(false);
    if (!oversized.ok) {
      expect(oversized.code).toBe("say_too_long");
    }
  });
});
