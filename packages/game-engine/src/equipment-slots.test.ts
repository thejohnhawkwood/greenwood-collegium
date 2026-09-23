import { describe, expect, it } from "vitest";
import { handleEquip } from "./equip.js";
import { equipmentSheet } from "./equipment-slots.js";
import { handleDrop } from "./drop.js";
import type { EngineRuntime, ItemInstance, WorldState } from "./state.js";

function runtime(): EngineRuntime {
  let sequence = 0;
  return {
    now: () => new Date("2026-09-22T12:00:00.000Z"),
    nextEventId: () => "evt-wear",
    nextSequence: () => (sequence += 1),
  };
}

function item(partial: ItemInstance): ItemInstance {
  return partial;
}

function world(): WorldState {
  return {
    rooms: {
      court: {
        id: "court",
        title: "Court",
        shortDescription: "A court.",
        longDescription: "A quiet court.",
        zone: "academy",
        exits: [],
        fixtures: [],
      },
    },
    characters: {
      fern: {
        id: "fern",
        name: "Fern",
        roomId: "court",
        discoveredRoomIds: ["court"],
      },
    },
    items: {
      sword: item({
        id: "sword",
        templateId: "practice-sword",
        name: "Practice Sword",
        examineDescription: "Wood.",
        holderCharacterId: "fern",
        category: "weapon",
        itemType: "sword",
        equipSlot: "main-hand",
      }),
      staff: item({
        id: "staff",
        templateId: "practice-staff",
        name: "Practice Staff",
        examineDescription: "Ash.",
        holderCharacterId: "fern",
        category: "weapon",
        itemType: "staff",
        equipSlot: "two-hand",
      }),
      sling: item({
        id: "sling",
        templateId: "practice-sling",
        name: "Practice Sling",
        examineDescription: "Leather.",
        holderCharacterId: "fern",
        category: "weapon",
        itemType: "sling",
        equipSlot: "ranged",
      }),
      key: item({
        id: "key",
        templateId: "small-copper-key",
        name: "Small Copper Key",
        examineDescription: "Copper.",
        holderCharacterId: "fern",
        category: "key",
        itemType: "key",
      }),
      buckler: item({
        id: "buckler",
        templateId: "buckler",
        name: "Round Buckler",
        examineDescription: "A small shield.",
        holderCharacterId: "fern",
        category: "ordinary",
        equipSlot: "off-hand",
      }),
      "ring-a": item({
        id: "ring-a",
        templateId: "ring-a",
        name: "Copper Ring",
        examineDescription: "A ring.",
        holderCharacterId: "fern",
        category: "ordinary",
        equipSlot: "ring",
      }),
      "ring-b": item({
        id: "ring-b",
        templateId: "ring-b",
        name: "Tin Ring",
        examineDescription: "A ring.",
        holderCharacterId: "fern",
        category: "ordinary",
        equipSlot: "ring",
      }),
      "ring-c": item({
        id: "ring-c",
        templateId: "ring-c",
        name: "Brass Ring",
        examineDescription: "A ring.",
        holderCharacterId: "fern",
        category: "ordinary",
        equipSlot: "ring",
      }),
    },
  };
}

describe("paper-doll wear slots", () => {
  it("wears a sword in the main hand", () => {
    const state = world();
    const equipped = handleEquip(
      state,
      { verb: "equip", characterId: "fern", target: "sword" },
      runtime(),
    );
    expect(equipped.ok).toBe(true);
    expect(state.characters.fern?.equippedItemId).toBe("sword");
    expect(state.characters.fern?.equipment?.["main-hand"]).toBe("sword");
    expect(
      equipmentSheet(state, state.characters.fern!).find((slot) => slot.id === "main-hand"),
    ).toMatchObject({ itemName: "Practice Sword" });
  });

  it("gives a staff both hands and refuses an off-hand item", () => {
    const state = world();
    const equipped = handleEquip(
      state,
      { verb: "equip", characterId: "fern", target: "staff" },
      runtime(),
    );
    expect(equipped.ok).toBe(true);
    if (equipped.ok) {
      expect(equipped.event.narration).toContain("It needs both hands.");
    }
    const sheet = equipmentSheet(state, state.characters.fern!);
    expect(sheet.find((slot) => slot.id === "off-hand")).toMatchObject({
      blocked: true,
      itemName: "Practice Staff",
    });
    expect(sheet.find((slot) => slot.id === "off-hand")?.itemId).toBeUndefined();
    const blocked = handleEquip(
      state,
      { verb: "equip", characterId: "fern", target: "buckler" },
      runtime(),
    );
    expect(blocked).toMatchObject({
      ok: false,
      code: "not_wearable",
      message: "The Practice Staff needs both hands.",
    });
  });

  it("wears a sling at range without clearing the sword", () => {
    const state = world();
    handleEquip(state, { verb: "equip", characterId: "fern", target: "sword" }, runtime());
    const ranged = handleEquip(
      state,
      { verb: "equip", characterId: "fern", target: "sling" },
      runtime(),
    );
    expect(ranged.ok).toBe(true);
    expect(state.characters.fern?.equippedItemId).toBe("sword");
    expect(state.characters.fern?.equipment?.ranged).toBe("sling");
    expect(state.characters.fern?.equipment?.["main-hand"]).toBe("sword");
  });

  it("refuses a key and clears a dropped weapon from every slot", () => {
    const state = world();
    const refused = handleEquip(
      state,
      { verb: "equip", characterId: "fern", target: "key" },
      runtime(),
    );
    expect(refused).toMatchObject({
      ok: false,
      code: "not_wearable",
      message: "You cannot wear the Small Copper Key.",
    });
    handleEquip(state, { verb: "equip", characterId: "fern", target: "sword" }, runtime());
    handleDrop(state, { verb: "drop", characterId: "fern", target: "sword" }, runtime());
    expect(state.characters.fern?.equippedItemId).toBeUndefined();
    expect(state.characters.fern?.equipment?.["main-hand"]).toBeUndefined();
  });

  it("fills both rings, then replaces the first", () => {
    const state = world();
    handleEquip(state, { verb: "equip", characterId: "fern", target: "copper ring" }, runtime());
    handleEquip(state, { verb: "equip", characterId: "fern", target: "tin ring" }, runtime());
    expect(state.characters.fern?.equipment).toMatchObject({
      "ring-1": "ring-a",
      "ring-2": "ring-b",
    });
    const replaced = handleEquip(
      state,
      { verb: "equip", characterId: "fern", target: "brass ring" },
      runtime(),
    );
    expect(replaced.ok).toBe(true);
    if (replaced.ok) {
      expect(replaced.event.narration).toContain("You set the Copper Ring aside.");
    }
    expect(state.characters.fern?.equipment?.["ring-1"]).toBe("ring-c");
  });
});
