import { describe, expect, it } from "vitest";
import { parsePlayerCommand } from "./parse-command.js";

describe("parsePlayerCommand", () => {
  it("prefers look over movement", () => {
    expect(parsePlayerCommand("look", "char-rowan")?.verb).toBe("look");
    expect(parsePlayerCommand("say hello", "char-rowan")?.verb).toBe("say");
    expect(parsePlayerCommand("south", "char-rowan")?.verb).toBe("move");
    expect(parsePlayerCommand("take key", "char-rowan")?.verb).toBe("take");
    expect(parsePlayerCommand("get key", "char-rowan")?.verb).toBe("take");
    expect(parsePlayerCommand("drop key", "char-rowan")?.verb).toBe("drop");
    expect(parsePlayerCommand("examine key", "char-rowan")?.verb).toBe("examine");
    expect(parsePlayerCommand("inventory", "char-rowan")?.verb).toBe("inventory");
    expect(parsePlayerCommand("i", "char-rowan")?.verb).toBe("inventory");
    expect(parsePlayerCommand("attack dummy", "char-rowan")).toEqual({
      verb: "attack",
      characterId: "char-rowan",
      target: "dummy",
    });
    expect(parsePlayerCommand("attack", "char-rowan")).toEqual({
      verb: "attack",
      characterId: "char-rowan",
    });
    expect(parsePlayerCommand("dance", "char-rowan")).toBeNull();
  });
});
