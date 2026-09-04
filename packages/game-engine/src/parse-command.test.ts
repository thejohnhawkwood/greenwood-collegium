import { describe, expect, it } from "vitest";
import { parsePlayerCommand } from "./parse-command.js";

describe("parsePlayerCommand", () => {
  it("prefers look over movement", () => {
    expect(parsePlayerCommand("look", "char-rowan")?.verb).toBe("look");
    expect(parsePlayerCommand("south", "char-rowan")?.verb).toBe("move");
    expect(parsePlayerCommand("dance", "char-rowan")).toBeNull();
  });
});
