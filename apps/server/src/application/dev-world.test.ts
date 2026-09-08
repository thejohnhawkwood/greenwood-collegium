import { describe, expect, it } from "vitest";
import { createDevWorld } from "./dev-world.js";

describe("createDevWorld", () => {
  it("loads the bundled rooms through the content package", () => {
    const world = createDevWorld();
    expect(Object.keys(world.rooms)).toHaveLength(25);
    expect(world.rooms["lantern-court"]?.title).toBe("Lantern Court");
    expect(world.rooms["east-gate"]?.title).toBe("East Gate");
    expect(world.items?.["item-copper-key-lantern-court"]).toBeUndefined();
    expect(world.starterPlacements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "item-copper-key-lantern-court",
          templateId: "small-copper-key",
          name: "Small Copper Key",
          roomId: "lantern-court",
        }),
      ]),
    );
    expect(world.itemTemplates?.["small-copper-key"]?.name).toBe("Small Copper Key");
    expect(world.enemies?.["enemy-practice-dummy-south-orchard"]?.name).toBe("Practice Dummy");
    expect(world.spells?.ember?.name).toBe("Ember");
  });
});
