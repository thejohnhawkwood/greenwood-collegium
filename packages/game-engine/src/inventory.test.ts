import { itemTakenEventSchema } from "@greenwood/contracts";
import { describe, expect, it } from "vitest";
import { handleDrop } from "./drop.js";
import { handleExamine } from "./examine.js";
import { handleInventory } from "./inventory.js";
import { handleLook } from "./look.js";
import { handleTake } from "./take.js";
import type { EngineRuntime, ItemInstance, WorldState } from "./state.js";

function courtWithKey(): WorldState {
  return {
    rooms: {
      "lantern-court": {
        id: "lantern-court",
        title: "Lantern Court",
        shortDescription: "A courtyard.",
        longDescription: "Blue lanterns drift.",
        zone: "academy-core",
        exits: [],
        fixtures: [
          {
            id: "npc-porter-bramble",
            name: "Porter Bramble",
            kind: "npc",
            examineDescription: "A hedgehog in a too-large porter's coat.",
          },
        ],
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
        accountUsername: "noelle",
        lookDescription: "A mole gent in earth-brown velveteen, paws large and gentle.",
        examineDescription:
          "He is a mole in earth-brown velveteen, eyes kind and a little short-sighted.",
        roomId: "lantern-court",
        discoveredRoomIds: ["lantern-court"],
      },
    },
    items: {
      "item-copper-key-lantern-court": {
        id: "item-copper-key-lantern-court",
        templateId: "small-copper-key",
        name: "Small Copper Key",
        examineDescription: "The bow is worn smooth.",
        roomId: "lantern-court",
      },
    },
  };
}

function runtime(): EngineRuntime {
  let sequence = 0;
  let event = 0;
  return {
    now: () => new Date("2026-09-07T18:00:00.000Z"),
    nextEventId: () => `evt-item-${String((event += 1))}`,
    nextSequence: () => (sequence += 1),
  };
}

function keyOf(world: WorldState): ItemInstance {
  const item = world.items?.["item-copper-key-lantern-court"];
  if (!item) {
    throw new Error("expected key");
  }
  return item;
}

describe("inventory slice", () => {
  it("shows a ground item in look, then hides it after take", () => {
    const world = courtWithKey();
    const clock = runtime();
    const before = handleLook(world, { verb: "look", characterId: "char-rowan" }, clock);
    expect(before.ok).toBe(true);
    if (before.ok) {
      expect(before.event.narration).toContain("Small Copper Key");
    }

    const taken = handleTake(
      world,
      { verb: "take", characterId: "char-rowan", target: "key" },
      clock,
    );
    expect(taken.ok).toBe(true);
    if (!taken.ok) {
      return;
    }
    expect(itemTakenEventSchema.parse(taken.events[0]).narration).toBe(
      "You take the Small Copper Key.",
    );
    expect(taken.notices[0]?.event.narration).toBe("Rowan the Hare takes the Small Copper Key.");
    expect(keyOf(world).holderCharacterId).toBe("char-rowan");
    expect(keyOf(world).roomId).toBeUndefined();

    const after = handleLook(world, { verb: "look", characterId: "char-moss" }, clock);
    expect(after.ok).toBe(true);
    if (after.ok) {
      expect(after.event.narration).not.toContain("Small Copper Key");
    }
  });

  it("rejects a second take of the same unique item", () => {
    const world = courtWithKey();
    const first = handleTake(
      world,
      { verb: "take", characterId: "char-rowan", target: "copper key" },
      runtime(),
    );
    const second = handleTake(
      world,
      { verb: "take", characterId: "char-moss", target: "key" },
      runtime(),
    );
    expect(first.ok).toBe(true);
    expect(second).toMatchObject({
      ok: false,
      code: "item_not_found",
    });
    expect(keyOf(world).holderCharacterId).toBe("char-rowan");
  });

  it("examines Porter by first name or full name", () => {
    const examined = handleExamine(
      courtWithKey(),
      { verb: "examine", characterId: "char-rowan", target: "porter" },
      runtime(),
    );
    expect(examined.ok).toBe(true);
    if (examined.ok) {
      expect(examined.event.narration).toContain("too-large porter");
    }
    expect(
      handleExamine(
        courtWithKey(),
        { verb: "examine", characterId: "char-rowan", target: "Porter Bramble" },
        runtime(),
      ).ok,
    ).toBe(true);
  });

  it("examines a nearby Collegian by given name or login name", () => {
    const byName = handleExamine(
      courtWithKey(),
      { verb: "examine", characterId: "char-rowan", target: "moss" },
      runtime(),
    );
    expect(byName.ok).toBe(true);
    if (byName.ok) {
      expect(byName.event.narration).toContain("earth-brown velveteen");
    }
    const byLogin = handleExamine(
      courtWithKey(),
      { verb: "examine", characterId: "char-rowan", target: "noelle" },
      runtime(),
    );
    expect(byLogin.ok).toBe(true);
    if (byLogin.ok) {
      expect(byLogin.event.narration).toContain("Moss the Mole");
    }
  });

  it("examines a fixture that has no extra description", () => {
    const world = courtWithKey();
    const room = world.rooms["lantern-court"];
    if (!room) {
      throw new Error("expected lantern court");
    }
    room.fixtures.push({
      id: "npc-quiet-owl",
      name: "Quiet Owl",
      kind: "npc",
    });
    const examined = handleExamine(
      world,
      { verb: "examine", characterId: "char-rowan", target: "owl" },
      runtime(),
    );
    expect(examined.ok).toBe(true);
    if (examined.ok) {
      expect(examined.event.narration).toContain("Quiet Owl is here.");
    }
  });

  it("examines, lists, and drops a carried item", () => {
    const world = courtWithKey();
    const clock = runtime();
    expect(
      handleTake(world, { verb: "take", characterId: "char-rowan", target: "key" }, clock).ok,
    ).toBe(true);

    const examined = handleExamine(
      world,
      { verb: "examine", characterId: "char-rowan", target: "key" },
      clock,
    );
    expect(examined.ok).toBe(true);
    if (examined.ok) {
      expect(examined.event.narration).toContain("The bow is worn smooth.");
    }

    const bag = handleInventory(world, { verb: "inventory", characterId: "char-rowan" }, clock);
    expect(bag.ok).toBe(true);
    if (bag.ok) {
      expect(bag.event.narration).toContain("Small Copper Key");
    }

    const dropped = handleDrop(
      world,
      { verb: "drop", characterId: "char-rowan", target: "key" },
      clock,
    );
    expect(dropped.ok).toBe(true);
    expect(keyOf(world).roomId).toBe("lantern-court");
    expect(keyOf(world).holderCharacterId).toBeUndefined();
  });
});
