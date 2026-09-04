import { describe, expect, it } from "vitest";
import { parseLookCommand } from "./parse-look.js";

describe("parseLookCommand", () => {
  it("accepts look aliases and ignores case", () => {
    expect(parseLookCommand(" LOOK ", "char-rowan")).toEqual({
      verb: "look",
      characterId: "char-rowan",
    });
    expect(parseLookCommand("l", "char-rowan")?.verb).toBe("look");
  });

  it("does not treat look fountain as a bare look", () => {
    expect(parseLookCommand("look fountain", "char-rowan")).toBeNull();
  });
});
