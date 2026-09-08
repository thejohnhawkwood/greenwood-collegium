import { describe, expect, it } from "vitest";
import { handleLook } from "./look.js";
import { handleTake } from "./take.js";
import { ensureCharacterStarterItems, starterInstanceId } from "./starter-items.js";
import type { EngineRuntime, StarterItemPlacement, WorldState } from "./state.js";

const keyPlacement: StarterItemPlacement = {
  id: "item-copper-key-lantern-court",
  templateId: "small-copper-key",
  name: "Small Copper Key",
  examineDescription: "The bow is worn smooth.",
  roomId: "lantern-court",
};

function courtWorld(): WorldState {
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
    items: {},
    starterPlacements: [keyPlacement],
  };
}

function runtime(): EngineRuntime {
  let sequence = 0;
  let event = 0;
  return {
    now: () => new Date("2026-09-07T22:00:00.000Z"),
    nextEventId: () => `evt-starter-${String((event += 1))}`,
    nextSequence: () => (sequence += 1),
  };
}

describe("per-Collegian starter items", () => {
  it("gives each Collegian a personal Arrival key they can take", () => {
    const world = courtWorld();
    const clock = runtime();

    const rowanLook = handleLook(world, { verb: "look", characterId: "char-rowan" }, clock);
    const mossLook = handleLook(world, { verb: "look", characterId: "char-moss" }, clock);
    expect(rowanLook.ok).toBe(true);
    expect(mossLook.ok).toBe(true);
    if (rowanLook.ok && mossLook.ok) {
      expect(rowanLook.event.narration).toContain("Small Copper Key");
      expect(mossLook.event.narration).toContain("Small Copper Key");
    }

    expect(
      handleTake(world, { verb: "take", characterId: "char-rowan", target: "key" }, clock).ok,
    ).toBe(true);
    expect(
      handleTake(world, { verb: "take", characterId: "char-moss", target: "key" }, clock).ok,
    ).toBe(true);

    expect(world.items?.[starterInstanceId(keyPlacement.id, "char-rowan")]?.holderCharacterId).toBe(
      "char-rowan",
    );
    expect(world.items?.[starterInstanceId(keyPlacement.id, "char-moss")]?.holderCharacterId).toBe(
      "char-moss",
    );
  });

  it("does not show another Collegian's personal key in look", () => {
    const world = courtWorld();
    const clock = runtime();
    expect(
      handleTake(world, { verb: "take", characterId: "char-rowan", target: "key" }, clock).ok,
    ).toBe(true);

    const mossLook = handleLook(world, { verb: "look", characterId: "char-moss" }, clock);
    expect(mossLook.ok).toBe(true);
    if (mossLook.ok) {
      expect(mossLook.event.narration).toContain("Small Copper Key");
    }
    const rowanLook = handleLook(world, { verb: "look", characterId: "char-rowan" }, clock);
    expect(rowanLook.ok).toBe(true);
    if (rowanLook.ok) {
      expect(rowanLook.event.narration).not.toContain("Small Copper Key");
    }
  });

  it("does not spawn a second key after the Collegian already holds one", () => {
    const world = courtWorld();
    ensureCharacterStarterItems(world, "char-rowan");
    const first = handleTake(
      world,
      { verb: "take", characterId: "char-rowan", target: "key" },
      runtime(),
    );
    expect(first.ok).toBe(true);
    expect(ensureCharacterStarterItems(world, "char-rowan")).toEqual([]);
    expect(
      handleTake(world, { verb: "take", characterId: "char-rowan", target: "key" }, runtime()),
    ).toMatchObject({ ok: false, code: "item_not_found" });
  });

  it("keeps a legacy held unique key instead of minting another", () => {
    const world = courtWorld();
    world.items = {
      "item-copper-key-lantern-court": {
        id: "item-copper-key-lantern-court",
        templateId: "small-copper-key",
        name: "Small Copper Key",
        examineDescription: "The bow is worn smooth.",
        holderCharacterId: "char-rowan",
      },
    };
    expect(ensureCharacterStarterItems(world, "char-rowan")).toEqual([]);
    expect(world.items[starterInstanceId(keyPlacement.id, "char-rowan")]).toBeUndefined();
  });
});
