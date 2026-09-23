import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { PlayState } from "@greenwood/contracts";
import { PrimerStage } from "./PrimerStage.js";

const primer: NonNullable<PlayState["primer"]> = {
  ink: 1,
  prompt: "The Primer holds 1 ink. Choose a vein.",
  leaves: [
    {
      schoolId: "ember",
      title: "Ember",
      mentor: "Mentor Cinder",
      outline: "lanceolate",
      open: true,
      nodes: [
        {
          id: "ember",
          name: "Ember",
          distance: 0,
          parents: [],
          status: "inked",
          legal: true,
          rank: 1,
          numbers: "Focus 4. Damage 5. Burns 2.",
          description: "A small coal of will that lands and lingers.",
          ranks: [
            {
              rank: 1,
              mark: "I",
              numbers: "Focus 4. Damage 5. Burns 2.",
              held: true,
              spend: false,
            },
            {
              rank: 2,
              mark: "II",
              numbers: "Focus 4. Damage 6. Burns 2.",
              held: false,
              spend: true,
            },
            {
              rank: 3,
              mark: "III",
              numbers: "Focus 3. Damage 6. Burns 2.",
              held: false,
              spend: false,
            },
            {
              rank: 4,
              mark: "IV",
              numbers: "Focus 3. Damage 7. Burns 2.",
              held: false,
              spend: false,
            },
            {
              rank: 5,
              mark: "V",
              numbers: "Focus 3. Damage 8. Burns 2.",
              held: false,
              spend: false,
            },
          ],
        },
        {
          id: "blaze-mantle",
          name: "Blaze-Mantle",
          distance: 3,
          parents: ["hearth-ward", "flame-breath"],
          join: "and",
          status: "locked",
          legal: false,
          description: "The next blow misses, and the attacker takes the burn.",
        },
      ],
    },
  ],
};

describe("PrimerStage", () => {
  it("draws the open leaf and only inks a node the server marked legal", () => {
    const html = renderToStaticMarkup(
      createElement(PrimerStage, {
        open: true,
        primer,
        onClose: () => {},
        onSend: () => {},
      }),
    );
    expect(html).toContain("Field Primer");
    expect(html).toContain("Ember, inked I, spend 1 ink for II");
    expect(html).toContain("Blaze-Mantle, locked");
    expect(html).toContain("Spend 1 ink for rank II.");
    expect(html).toContain('class="is-held"');
    expect(html).toContain("Preview");
    expect(html).toContain("Focus 4. Damage 6. Burns 2.");
    expect(html).toContain("A small coal of will that lands and lingers.");
    expect(html).not.toContain("Vital leaf");
  });
});
