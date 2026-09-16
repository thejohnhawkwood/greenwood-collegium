import { describe, expect, it } from "vitest";
import { handleDrink } from "./drink.js";
import { COURTYARD_WELL_ID, tickCharacterVitals } from "./recover.js";
import type { EngineRuntime, WorldState } from "./state.js";

function runtime(): EngineRuntime {
  return {
    now: () => new Date("2026-09-16T22:00:00.000Z"),
    nextEventId: () => "evt-drink",
    nextSequence: () => 1,
  };
}

function world(): WorldState {
  return {
    rooms: {
      "lantern-court": {
        id: "lantern-court",
        title: "Lantern Court",
        shortDescription: "A courtyard.",
        longDescription: "A well sits at the oak's roots.",
        zone: "academy-core",
        exits: [{ direction: "south", toRoomId: "south-orchard" }],
        fixtures: [
          {
            id: COURTYARD_WELL_ID,
            name: "Courtyard Well",
            kind: "object",
            lookDescription: "A stone well. Type drink well.",
            examineDescription: "Cold water. Drink to restore health and focus.",
          },
        ],
      },
      "south-orchard": {
        id: "south-orchard",
        title: "South Orchard",
        shortDescription: "Apples.",
        longDescription: "Apples.",
        zone: "academy-grounds",
        exits: [{ direction: "north", toRoomId: "lantern-court" }],
        fixtures: [],
      },
    },
    characters: {
      "char-rowan": {
        id: "char-rowan",
        name: "Rowan the Hare",
        roomId: "lantern-court",
        discoveredRoomIds: ["lantern-court"],
        health: 7,
        maxHealth: 20,
        focus: 2,
        maxFocus: 10,
      },
    },
  };
}

describe("courtyard well and vital ticks", () => {
  it("drinks the well to restore health and focus", () => {
    const state = world();
    const drank = handleDrink(
      state,
      { verb: "drink", characterId: "char-rowan", target: "well" },
      runtime(),
    );
    expect(drank.ok).toBe(true);
    if (drank.ok) {
      expect(drank.event.narration).toContain("Health and focus return");
    }
    expect(state.characters["char-rowan"]?.health).toBe(20);
    expect(state.characters["char-rowan"]?.focus).toBe(10);
    const again = handleDrink(state, { verb: "drink", characterId: "char-rowan" }, runtime());
    expect(again.ok && again.event.narration).toContain("already rested");
  });

  it("refuses a drink away from the well or during a fight", () => {
    const state = world();
    state.characters["char-rowan"]!.roomId = "south-orchard";
    expect(
      handleDrink(state, { verb: "drink", characterId: "char-rowan" }, runtime()),
    ).toMatchObject({ ok: false, code: "no_well" });
    state.characters["char-rowan"]!.roomId = "lantern-court";
    state.characters["char-rowan"]!.encounterId = "enc-1";
    state.encounters = {
      "enc-1": {
        id: "enc-1",
        roomId: "lantern-court",
        status: "awaiting_player",
        round: 1,
        playerId: "char-rowan",
        spawnId: "enemy-1",
        enemy: {
          id: "enemy-1",
          name: "Dummy",
          health: 8,
          maxHealth: 8,
          attack: 2,
          experience: 4,
        },
        effects: [],
      },
    };
    expect(
      handleDrink(state, { verb: "drink", characterId: "char-rowan" }, runtime()),
    ).toMatchObject({ ok: false, code: "in_combat" });
  });

  it("ticks one health and one focus outside combat, then stops at the cap", () => {
    const state = world();
    expect(tickCharacterVitals(state)).toEqual(["char-rowan"]);
    expect(state.characters["char-rowan"]?.health).toBe(8);
    expect(state.characters["char-rowan"]?.focus).toBe(3);
    state.characters["char-rowan"]!.health = 20;
    state.characters["char-rowan"]!.focus = 10;
    expect(tickCharacterVitals(state)).toEqual([]);
    state.characters["char-rowan"]!.health = 12;
    state.characters["char-rowan"]!.encounterId = "enc-1";
    state.encounters = {
      "enc-1": {
        id: "enc-1",
        roomId: "lantern-court",
        status: "awaiting_player",
        round: 1,
        playerId: "char-rowan",
        spawnId: "enemy-1",
        enemy: {
          id: "enemy-1",
          name: "Dummy",
          health: 8,
          maxHealth: 8,
          attack: 2,
          experience: 4,
        },
        effects: [],
      },
    };
    expect(tickCharacterVitals(state)).toEqual([]);
    expect(state.characters["char-rowan"]?.health).toBe(12);
  });
});
