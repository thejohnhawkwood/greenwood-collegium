import { describe, expect, it } from "vitest";
import { createDevWorld } from "./dev-world.js";

describe("createDevWorld", () => {
  it("loads the bundled rooms through the content package", () => {
    const world = createDevWorld();
    expect(Object.keys(world.rooms)).toHaveLength(25);
    expect(world.rooms["lantern-court"]?.title).toBe("Lantern Court");
    expect(world.rooms["east-gate"]?.title).toBe("East Gate");
  });
});
