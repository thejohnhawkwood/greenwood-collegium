import { describe, expect, it } from "vitest";
import {
  characterCreationIntro,
  formatCharacterName,
  isKnownSpecies,
  listSpecies,
  suggestedCharacterNames,
} from "./character-creation.js";

describe("character creation content", () => {
  it("lists PRD species and formats a play name", () => {
    expect(listSpecies().map((species) => species.id)).toContain("otter");
    expect(isKnownSpecies("hare")).toBe(true);
    expect(formatCharacterName("Lumen", "otter")).toBe("Lumen the Otter");
    expect(characterCreationIntro()).toContain("Greenwood Collegium");
    expect(suggestedCharacterNames().length).toBeGreaterThan(10);
  });
});
