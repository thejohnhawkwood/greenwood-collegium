import { describe, expect, it } from "vitest";
import { namesMatch } from "./names.js";

describe("namesMatch", () => {
  it("matches people and enemies by a single name word", () => {
    expect(namesMatch("Porter Bramble", "npc-porter-bramble", "porter")).toBe(true);
    expect(namesMatch("Porter Bramble", "npc-porter-bramble", "Bramble")).toBe(true);
    expect(namesMatch("Lumen the Otter", "char-1", "lumen")).toBe(true);
    expect(namesMatch("Practice Dummy", "enemy-practice-dummy-south-orchard", "dummy")).toBe(true);
    expect(namesMatch("Small Copper Key", "item-1", "key")).toBe(true);
    expect(namesMatch("Porter Bramble", "npc-porter-bramble", "key")).toBe(false);
  });
});
