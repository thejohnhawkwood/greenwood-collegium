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
    expect(parsePlayerCommand("x porter", "char-rowan")).toEqual({
      verb: "examine",
      characterId: "char-rowan",
      target: "porter",
    });
    expect(parsePlayerCommand("admin announce Lunch.", "char-rowan")?.verb).toBe("announce");
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
    expect(parsePlayerCommand("cast ember dummy", "char-rowan")).toEqual({
      verb: "cast",
      characterId: "char-rowan",
      spell: "ember",
      target: "dummy",
    });
    expect(parsePlayerCommand("cast ember", "char-rowan")).toEqual({
      verb: "cast",
      characterId: "char-rowan",
      spell: "ember",
    });
    expect(parsePlayerCommand("help", "char-rowan")?.verb).toBe("help");
    expect(parsePlayerCommand("help look", "char-rowan")).toEqual({
      verb: "help",
      characterId: "char-rowan",
      topic: "look",
    });
    expect(parsePlayerCommand("quests", "char-rowan")?.verb).toBe("quests");
    expect(parsePlayerCommand("take", "char-rowan")).toEqual({
      verb: "take",
      characterId: "char-rowan",
      target: "",
    });
    expect(parsePlayerCommand("where", "char-rowan")?.verb).toBe("look");
    expect(parsePlayerCommand("place", "char-rowan")?.verb).toBe("look");
    expect(parsePlayerCommand("stats", "char-rowan")?.verb).toBe("stats");
    expect(parsePlayerCommand("dance", "char-rowan")).toBeNull();
  });
});
