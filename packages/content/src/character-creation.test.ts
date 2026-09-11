import { describe, expect, it } from "vitest";
import {
  CHARACTER_GENDERS,
  characterCreationIntro,
  describeCollegian,
  formatCharacterName,
  isKnownGender,
  isKnownSpecies,
  listSpecies,
  speciesWeaponProficiency,
  suggestedCharacterNames,
} from "./character-creation.js";

describe("character creation content", () => {
  it("lists PRD species and formats a play name", () => {
    expect(listSpecies().map((species) => species.id)).toContain("otter");
    expect(isKnownSpecies("hare")).toBe(true);
    expect(speciesWeaponProficiency("hare")).toBe("sword");
    expect(speciesWeaponProficiency("badger")).toBe("staff");
    expect(formatCharacterName("Lumen", "otter")).toBe("Lumen the Otter");
    expect(characterCreationIntro()).toContain("Greenwood Collegium");
    expect(suggestedCharacterNames().length).toBeGreaterThan(10);
    expect(CHARACTER_GENDERS.map((gender) => gender.id)).toEqual(["female", "male"]);
    expect(isKnownGender("nonbinary")).toBe(false);
    expect(describeCollegian("otter", "female").look).toContain("otter");
    expect(describeCollegian("otter", "female").examine).toContain("otter");
    for (const species of listSpecies()) {
      expect(describeCollegian(species.id, "female").examine.length).toBeGreaterThan(20);
      expect(describeCollegian(species.id, "male").examine.length).toBeGreaterThan(20);
    }
  });
});
