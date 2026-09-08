import { starterInstanceId } from "@greenwood/game-engine";
import { describe, expect, it } from "vitest";
import { InMemoryItemRepository } from "../persistence/memory.js";
import { createDevWorld } from "./dev-world.js";
import {
  hydrateWorldItems,
  itemSeedsFromWorld,
  persistCharacterStarterItems,
  starterSeedsForCharacter,
} from "./item-state.js";

describe("item-state starter copies", () => {
  it("seeds only shared room items from a fresh world", () => {
    const world = createDevWorld();
    expect(itemSeedsFromWorld(world).map((seed) => seed.id)).toEqual([
      "item-primer-library-stacks",
    ]);
  });

  it("persists a personal Arrival key and restores it after hydrate", async () => {
    const world = createDevWorld();
    const items = new InMemoryItemRepository();
    await persistCharacterStarterItems(world, "char-rowan", items);

    const personalId = starterInstanceId("item-copper-key-lantern-court", "char-rowan");
    expect(starterSeedsForCharacter(world, "char-rowan")).toEqual([
      {
        id: personalId,
        templateId: "small-copper-key",
        roomId: "lantern-court",
      },
    ]);
    expect((await items.list()).some((record) => record.id === personalId)).toBe(true);

    const restored = createDevWorld();
    await hydrateWorldItems(restored, items);
    expect(restored.items?.[personalId]).toMatchObject({
      templateId: "small-copper-key",
      roomId: "lantern-court",
      availableToCharacterId: "char-rowan",
    });
  });

  it("keeps a held legacy courtyard key and ignores an unclaimed leftover seed", async () => {
    const held = new InMemoryItemRepository();
    await held.ensurePlacements([
      {
        id: "item-copper-key-lantern-court",
        templateId: "small-copper-key",
        roomId: "lantern-court",
      },
    ]);
    expect(await held.claim("item-copper-key-lantern-court", "char-rowan", "lantern-court")).toBe(
      true,
    );
    const heldWorld = createDevWorld();
    await hydrateWorldItems(heldWorld, held);
    expect(heldWorld.items?.["item-copper-key-lantern-court"]?.holderCharacterId).toBe(
      "char-rowan",
    );

    const unused = new InMemoryItemRepository();
    await unused.ensurePlacements([
      {
        id: "item-copper-key-lantern-court",
        templateId: "small-copper-key",
        roomId: "lantern-court",
      },
    ]);
    const emptyWorld = createDevWorld();
    await hydrateWorldItems(emptyWorld, unused);
    expect(emptyWorld.items?.["item-copper-key-lantern-court"]).toBeUndefined();
  });
});
