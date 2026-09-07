import {
  handleExamine,
  handleJoin,
  handleLook,
  handleMove,
  type EngineRuntime,
} from "@greenwood/game-engine";
import { describe, expect, it } from "vitest";
import { createDevWorld } from "./dev-world.js";

function runtime(): EngineRuntime {
  let sequence = 0;
  let event = 0;
  return {
    now: () => new Date("2026-09-07T22:00:00.000Z"),
    nextEventId: () => `evt-ex-${String((event += 1))}`,
    nextSequence: () => (sequence += 1),
  };
}

describe("bundled examine targets", () => {
  it("examines Porter in Lantern Court and the dummy after walking south", () => {
    const world = createDevWorld();
    const clock = runtime();
    const joined = handleJoin(
      world,
      {
        verb: "join",
        characterId: "char-rowan",
        name: "Rowan the Hare",
        roomId: "lantern-court",
      },
      clock,
    );
    expect(joined.ok).toBe(true);

    const looked = handleLook(world, { verb: "look", characterId: "char-rowan" }, clock);
    expect(looked.ok).toBe(true);
    if (looked.ok) {
      expect(looked.event.narration).toContain("Porter Bramble — A hedgehog porter");
    }

    const porter = handleExamine(
      world,
      { verb: "examine", characterId: "char-rowan", target: "porter" },
      clock,
    );
    expect(porter.ok).toBe(true);
    if (porter.ok) {
      expect(porter.event.narration).toContain("hedgehog");
    }

    const dummyInCourt = handleExamine(
      world,
      { verb: "examine", characterId: "char-rowan", target: "dummy" },
      clock,
    );
    expect(dummyInCourt).toMatchObject({
      ok: false,
      code: "item_not_found",
    });
    if (!dummyInCourt.ok) {
      expect(dummyInCourt.message).toContain("South Orchard");
    }

    expect(
      handleMove(world, { verb: "move", characterId: "char-rowan", direction: "south" }, clock).ok,
    ).toBe(true);

    const dummy = handleExamine(
      world,
      { verb: "examine", characterId: "char-rowan", target: "dummy" },
      clock,
    );
    expect(dummy.ok).toBe(true);
    if (dummy.ok) {
      expect(dummy.event.narration).toContain("well-worn");
    }
  });
});
