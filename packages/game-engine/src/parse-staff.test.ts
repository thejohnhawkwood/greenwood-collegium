import { describe, expect, it } from "vitest";
import { parseStaffCommand } from "./parse-staff.js";

describe("parseStaffCommand", () => {
  it("reads classroom verbs with or without the admin prefix", () => {
    expect(parseStaffCommand("admin announce The lanterns are lit.", "char-1")).toEqual({
      verb: "announce",
      characterId: "char-1",
      text: "The lanterns are lit.",
    });
    expect(parseStaffCommand("inspect lumen", "char-1")).toEqual({
      verb: "inspect",
      characterId: "char-1",
      target: "lumen",
    });
    expect(parseStaffCommand("admin mute lumen 15", "char-1")).toEqual({
      verb: "mute",
      characterId: "char-1",
      target: "lumen",
      minutes: 15,
    });
    expect(parseStaffCommand("kick Practice Dummy", "char-1")).toEqual({
      verb: "kick",
      characterId: "char-1",
      target: "Practice Dummy",
    });
    expect(parseStaffCommand("admin", "char-1")?.verb).toBe("staff-help");
    expect(parseStaffCommand("admin who", "char-1")?.verb).toBe("staff-help");
    expect(parseStaffCommand("dance", "char-1")).toBeNull();
  });
});
