import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { PlayState } from "@greenwood/contracts";
import { PrimerStage } from "./PrimerStage.js";

const primer: NonNullable<PlayState["primer"]> = {
  pennedBy: "Mentor Cinder",
  prompt: "Mentor Cinder's hand offers three leaves.",
  cards: [
    {
      command: "1",
      title: "Ember",
      badge: "Rank II",
      kind: "upgrade",
      numbers: "Focus 4. Damage 6. Burns 2.",
      description: "A small coal of will that lands and lingers.",
      pennedBy: "Cinder Wick",
    },
    {
      command: "2",
      title: "Flame-Breath",
      badge: "New",
      kind: "unlock",
      numbers: "Focus 5. Damage 4. Burns 1.",
      description: "A gust of open flame. It scorches and leaves one burn.",
    },
    {
      command: "3",
      title: "Vital leaf",
      badge: "Vital",
      kind: "vital",
      numbers: "+2 health. +1 focus.",
      description: "A thicker page. Your health and focus rise so the next field is kinder.",
    },
  ],
};

describe("PrimerStage", () => {
  it("paints three clickable leaves with the offered numbers and descriptions", () => {
    const html = renderToStaticMarkup(createElement(PrimerStage, { primer, onSend: () => {} }));
    expect(html).toContain('aria-label="Field Primer choices"');
    expect(html).toContain("Mentor Cinder&#x27;s hand offers three leaves.");
    expect(html).toContain("Ember");
    expect(html).toContain("Rank II");
    expect(html).toContain("Focus 4. Damage 6. Burns 2.");
    expect(html).toContain("A small coal of will that lands and lingers.");
    expect(html).toContain("Cinder Wick");
    expect(html).toContain("Flame-Breath");
    expect(html).toContain("A gust of open flame. It scorches and leaves one burn.");
    expect(html).toContain("Vital leaf");
    expect(html).toContain("+2 health. +1 focus.");
    expect(html).toContain(
      'aria-label="Choose 1: Ember. A small coal of will that lands and lingers."',
    );
    expect(html).toContain('class="primer-card primer-card-upgrade"');
    expect(html).toContain("<button");
  });
});
