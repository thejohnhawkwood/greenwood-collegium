import { describe, expect, it } from "vitest";
import { parseSayCommand } from "./parse-say.js";

describe("parseSayCommand", () => {
  it("keeps the spoken text and case", () => {
    expect(parseSayCommand("say Meet me in the library.", "char-rowan")).toEqual({
      verb: "say",
      characterId: "char-rowan",
      text: "Meet me in the library.",
    });
  });

  it("accepts a bare say as empty speech", () => {
    expect(parseSayCommand("SAY", "char-rowan")?.text).toBe("");
  });
});
