import { describe, expect, it } from "vitest";
import { handleEat } from "./eat.js";
import { ORCHARD_APPLES_ID } from "./recover.js";
import type { EngineRuntime, WorldState } from "./state.js";

function runtime(): EngineRuntime {
  return {
    now: () => new Date("2026-09-16T22:00:00.000Z"),
    nextEventId: () => "evt-eat",
    nextSequence: () => 1,
  };
}

function world(): WorldState {
  return {
    rooms: {
      "south-orchard": {
        id: "south-orchard",
        title: "South Orchard",
        shortDescription: "Apples.",
        longDescription: "Windfalls.",
        zone: "academy-grounds",
        exits: [{ direction: "north", toRoomId: "lantern-court" }],
        fixtures: [
          {
            id: ORCHARD_APPLES_ID,
            name: "Fallen Apples",
            kind: "object",
            lookDescription: "Type eat apple.",
            examineDescription: "Tart windfalls.",
          },
        ],
      },
      "lantern-court": {
        id: "lantern-court",
        title: "Lantern Court",
        shortDescription: "A courtyard.",
        longDescription: "A well.",
        zone: "academy-core",
        exits: [{ direction: "south", toRoomId: "south-orchard" }],
        fixtures: [],
      },
    },
    characters: {
      "char-rowan": {
        id: "char-rowan",
        name: "Rowan the Hare",
        roomId: "south-orchard",
        discoveredRoomIds: ["south-orchard"],
        health: 7,
        maxHealth: 20,
        focus: 2,
        maxFocus: 10,
      },
    },
  };
}

describe("orchard apples", () => {
  it("eats fallen apples to restore health and focus", () => {
    const state = world();
    const ate = handleEat(
      state,
      { verb: "eat", characterId: "char-rowan", target: "apple" },
      runtime(),
    );
    expect(ate.ok).toBe(true);
    if (ate.ok) {
      expect(ate.event.narration).toContain("Health and focus return");
    }
    expect(state.characters["char-rowan"]?.health).toBe(20);
    expect(state.characters["char-rowan"]?.focus).toBe(10);
    const again = handleEat(state, { verb: "eat", characterId: "char-rowan" }, runtime());
    expect(again.ok && again.event.narration).toContain("already rested");
  });

  it("refuses a meal away from food or during a fight", () => {
    const state = world();
    state.characters["char-rowan"]!.roomId = "lantern-court";
    expect(handleEat(state, { verb: "eat", characterId: "char-rowan" }, runtime())).toMatchObject({
      ok: false,
      code: "no_food",
    });
    state.characters["char-rowan"]!.roomId = "south-orchard";
    state.characters["char-rowan"]!.encounterId = "enc-1";
    state.encounters = {
      "enc-1": {
        id: "enc-1",
        roomId: "south-orchard",
        status: "awaiting_intents",
        round: 1,
        playerId: "char-rowan",
        spawnId: "enemy-1",
        lockDeadlineAt: "2026-09-16T19:00:12.000Z",
        enemy: {
          id: "enemy-1",
          name: "Dummy",
          health: 8,
          maxHealth: 8,
          focus: 6,
          maxFocus: 6,
          attack: 2,
          experience: 4,
        },
        effects: [],
      },
    };
    expect(handleEat(state, { verb: "eat", characterId: "char-rowan" }, runtime())).toMatchObject({
      ok: false,
      code: "in_combat",
    });
  });
});
