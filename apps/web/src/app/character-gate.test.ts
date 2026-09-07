import { describe, expect, it } from "vitest";
import { shouldShowCharacterGate } from "./character-gate.js";

describe("shouldShowCharacterGate", () => {
  it("shows only for a signed-in account that still needs a Collegian", () => {
    expect(shouldShowCharacterGate(undefined)).toBe(false);
    expect(
      shouldShowCharacterGate({
        accountId: "acc-1",
        username: "noelle",
        role: "student",
        characterComplete: false,
      }),
    ).toBe(true);
    expect(
      shouldShowCharacterGate({
        accountId: "acc-1",
        username: "noelle",
        role: "student",
        characterComplete: true,
        characterId: "char-1",
        characterName: "Lumen the Otter",
      }),
    ).toBe(false);
  });
});
