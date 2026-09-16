import { describe, expect, it } from "vitest";
import {
  APPEARANCE_LIVE_FIELDS,
  APPEARANCE_LOOK_LABELS,
  appearanceLook,
  appearanceSchema,
  DEFAULT_APPEARANCE,
  resolveAppearance,
  resolveVisualGender,
  snapAppearanceValue,
} from "./appearance.js";
import { authCharacterCreateRequestSchema } from "./auth/schemas.js";

const v1Save = {
  version: 1,
  build: "sturdy",
  palette: "ash",
  marking: "blaze",
  face: "keen",
  clothing: "indigo",
  accessory: "satchel",
};

describe("appearance profiles", () => {
  it("rejects unknown layers, versions and injected fields on writes", () => {
    for (const bad of [
      { ...DEFAULT_APPEARANCE, palette: "url(secret)" },
      { ...DEFAULT_APPEARANCE, version: 1 },
      { ...DEFAULT_APPEARANCE, version: 3 },
      { ...DEFAULT_APPEARANCE, accountId: "other" },
      { palette: "ash" },
    ]) {
      expect(appearanceSchema.safeParse(bad).success).toBe(false);
      expect(
        authCharacterCreateRequestSchema.safeParse({
          name: "Fern",
          speciesId: "fox",
          gender: "female",
          appearance: bad,
        }).success,
      ).toBe(false);
    }
  });
  it("recovers missing saves, upgrades v1, and defaults unavailable layers", () => {
    expect(resolveAppearance(undefined)).toEqual(DEFAULT_APPEARANCE);
    expect(resolveAppearance(v1Save)).toEqual({
      ...DEFAULT_APPEARANCE,
      build: "sturdy",
      palette: "ash",
      marking: "blaze",
      face: "keen",
      clothing: "indigo",
      accessory: "satchel",
      muzzle: "tapered",
      ears: "neat",
    });
    expect(
      resolveAppearance({ ...DEFAULT_APPEARANCE, palette: "ash", clothing: "removed" }),
    ).toEqual({ ...DEFAULT_APPEARANCE, palette: "ash" });
    expect(resolveAppearance({ ...DEFAULT_APPEARANCE, version: 9 })).toEqual(DEFAULT_APPEARANCE);
  });
  it("snaps slider indexes onto authored keys", () => {
    expect(snapAppearanceValue("palette", 0)).toBe("chestnut");
    expect(snapAppearanceValue("palette", 3.4)).toBe("dusk");
    expect(snapAppearanceValue("palette", 99)).toBe("cream");
    expect(snapAppearanceValue("muzzle", 1)).toBe("tapered");
    expect(APPEARANCE_LIVE_FIELDS.map(([key]) => key)).toEqual(["build", "palette"]);
    expect(appearanceLook({ clothing: "russet" })).toBe("russet");
    expect(appearanceLook({})).toBe("fern");
    expect(APPEARANCE_LOOK_LABELS.indigo).toBe("Scriptorium");
  });
  it("resolves presentation gender from the character record", () => {
    expect(resolveVisualGender("male")).toBe("male");
    expect(resolveVisualGender("female")).toBe("female");
    expect(resolveVisualGender(undefined)).toBe("female");
    expect(resolveVisualGender("other")).toBe("female");
  });
});
