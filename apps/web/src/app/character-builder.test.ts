import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DEFAULT_APPEARANCE } from "@greenwood/contracts";
import { CharacterBuilder } from "./CharacterBuilder.js";
import { CharacterPortrait } from "./CharacterPortrait.js";
import { KNOWN_SPECIES, lookArtSrc, portraitLayers } from "./portrait-layers.js";

describe("character builder", () => {
  it("picks a different painted body for female and male of every species", () => {
    const paths = new Set<string>();
    for (const speciesId of KNOWN_SPECIES) {
      const female = portraitLayers({
        speciesId,
        gender: "female",
        appearance: DEFAULT_APPEARANCE,
      });
      const male = portraitLayers({
        speciesId,
        gender: "male",
        appearance: DEFAULT_APPEARANCE,
      });
      const femaleBody = female.find((layer) => layer.layer === "body")?.src;
      const maleBody = male.find((layer) => layer.layer === "body")?.src;
      expect(femaleBody).toBe(lookArtSrc(speciesId, "female", "fern"));
      expect(maleBody).toBe(lookArtSrc(speciesId, "male", "fern"));
      expect(femaleBody).not.toBe(maleBody);
      paths.add(femaleBody ?? "");
      paths.add(maleBody ?? "");
    }
    expect(paths.size).toBe(22);
  });
  it("renders the builder catalog with both bodies and live workshop copy", () => {
    const html = renderToStaticMarkup(createElement(CharacterBuilder));
    expect(html).toContain("Character builder test");
    expect(html).toContain("All species, both bodies");
    expect(html).toContain("Courtyard");
    expect(html).toContain("Scriptorium");
    expect(html).toContain("Road");
    expect(html).toContain('type="range"');
    expect(html).not.toContain("Muzzle");
    expect(html).toContain("fox-female-fern.png");
    expect(html).toContain("fox-female-indigo.png");
    expect(html).toContain("fox-female-russet.png");
    expect(html).toContain("toad-male-fern.png");
    expect(html).not.toContain("/art/characters/clothing/");
    expect(html).not.toContain("/art/characters/markings/");
    expect(
      renderToStaticMarkup(
        createElement(CharacterPortrait, {
          name: "Briar",
          visual: {
            speciesId: "fox",
            gender: "male",
            appearance: DEFAULT_APPEARANCE,
          },
        }),
      ),
    ).toContain('data-gender="male"');
  });
});
