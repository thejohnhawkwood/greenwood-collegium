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
    expect(parsePlayerCommand("defend", "char-rowan")).toEqual({
      verb: "defend",
      characterId: "char-rowan",
    });
    expect(parsePlayerCommand("flee", "char-rowan")).toEqual({
      verb: "flee",
      characterId: "char-rowan",
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
    expect(parsePlayerCommand("spells", "char-rowan")?.verb).toBe("spells");
    expect(parsePlayerCommand("grimoire", "char-rowan")?.verb).toBe("spells");
    expect(parsePlayerCommand("map", "char-rowan")?.verb).toBe("map");
    expect(parsePlayerCommand("chart", "char-rowan")?.verb).toBe("map");
    expect(parsePlayerCommand("travel Library Stacks", "char-rowan")).toEqual({
      verb: "travel",
      characterId: "char-rowan",
      target: "Library Stacks",
    });
    expect(parsePlayerCommand("equip sword", "char-rowan")).toEqual({
      verb: "equip",
      characterId: "char-rowan",
      target: "sword",
    });
    expect(parsePlayerCommand("unequip sword", "char-rowan")).toEqual({
      verb: "unequip",
      characterId: "char-rowan",
      target: "sword",
    });
    expect(parsePlayerCommand("take off Practice Sword", "char-rowan")).toEqual({
      verb: "unequip",
      characterId: "char-rowan",
      target: "Practice Sword",
    });
    expect(parsePlayerCommand("1", "char-rowan")).toEqual({
      verb: "say",
      characterId: "char-rowan",
      text: "1",
    });
    expect(parsePlayerCommand("bye", "char-rowan")).toEqual({
      verb: "bye",
      characterId: "char-rowan",
    });
    expect(parsePlayerCommand("close", "char-rowan")).toEqual({
      verb: "bye",
      characterId: "char-rowan",
    });
    expect(parsePlayerCommand("drink well", "char-rowan")).toEqual({
      verb: "drink",
      characterId: "char-rowan",
      target: "well",
    });
    expect(parsePlayerCommand("drink", "char-rowan")).toEqual({
      verb: "drink",
      characterId: "char-rowan",
    });
    expect(parsePlayerCommand("eat apple", "char-rowan")).toEqual({
      verb: "eat",
      characterId: "char-rowan",
      target: "apple",
    });
    expect(parsePlayerCommand("eat", "char-rowan")).toEqual({
      verb: "eat",
      characterId: "char-rowan",
    });
    expect(parsePlayerCommand("duel moss", "char-rowan")).toEqual({
      verb: "duel",
      characterId: "char-rowan",
      action: "challenge",
      target: "moss",
    });
    expect(parsePlayerCommand("dance", "char-rowan")).toBeNull();
  });
});
