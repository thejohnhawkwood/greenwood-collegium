import { describe, expect, it } from "vitest";
import { parseMoveCommand } from "./parse-move.js";

describe("parseMoveCommand", () => {
  it("accepts direction aliases and go <direction>", () => {
    expect(parseMoveCommand(" NORTH ", "char-rowan")).toEqual({
      verb: "move",
      characterId: "char-rowan",
      direction: "north",
    });
    expect(parseMoveCommand("n", "char-rowan")?.direction).toBe("north");
    expect(parseMoveCommand("go west", "char-rowan")?.direction).toBe("west");
  });

  it("keeps unknown go targets as a move so the engine can reject them", () => {
    expect(parseMoveCommand("go tower", "char-rowan")).toEqual({
      verb: "move",
      characterId: "char-rowan",
      direction: "tower",
    });
  });

  it("does not treat extra words as a bare direction", () => {
    expect(parseMoveCommand("north quickly", "char-rowan")).toBeNull();
  });
});
