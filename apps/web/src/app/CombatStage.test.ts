import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DEFAULT_APPEARANCE } from "@greenwood/contracts";
import { CombatStage } from "./CombatStage.js";
import { encounterFoeVisual, secondsLeft } from "./combat-stage.js";
import { npcArtSrc } from "./npc-plates.js";

const encounter = {
  id: "enc-1",
  round: 1,
  status: "awaiting_intents" as const,
  lockDeadlineAt: "2026-09-16T19:00:12.000Z",
  enemy: {
    id: "enemy-practice-dummy-south-orchard",
    name: "Practice Dummy",
    health: 8,
    maxHealth: 8,
    focus: 6,
    maxFocus: 6,
  },
  moves: [
    { label: "Attack", command: "attack", kind: "attack" as const },
    { label: "Ember", command: "cast ember", kind: "cast" as const },
    { label: "Defend", command: "defend", kind: "defend" as const },
    { label: "Flee", command: "flee", kind: "flee" as const },
  ],
};

describe("CombatStage", () => {
  it("counts remaining lock seconds without going negative", () => {
    expect(secondsLeft("2026-09-16T19:00:12.000Z", Date.parse("2026-09-16T19:00:00.000Z"))).toBe(
      12,
    );
    expect(secondsLeft("2026-09-16T19:00:12.000Z", Date.parse("2026-09-16T19:00:20.000Z"))).toBe(0);
  });

  it("shows foe vitals and numbered lock-in moves", () => {
    const html = renderToStaticMarkup(createElement(CombatStage, { encounter, onSend: () => {} }));
    expect(html).toContain('aria-label="Fighting Practice Dummy"');
    expect(html).toContain("Round 1");
    expect(html).toContain("Health 8 / 8");
    expect(html).toContain("Focus 6 / 6");
    expect(html).toContain(npcArtSrc("enemy-practice-dummy-south-orchard"));
    expect(html).toContain("1. Attack");
    expect(html).toContain("2. Ember");
    expect(html).toContain("3. Defend");
    expect(html).toContain("4. Flee");
  });

  it("paints a classmate look on a duel card from play-state peers", () => {
    const visual = {
      speciesId: "mole",
      gender: "male" as const,
      appearance: { ...DEFAULT_APPEARANCE, clothing: "russet" as const },
    };
    const duel = {
      ...encounter,
      enemy: { ...encounter.enemy, id: "char-moss", name: "Moss the Mole" },
    };
    const html = renderToStaticMarkup(
      createElement(CombatStage, { encounter: duel, foeVisual: visual, onSend: () => {} }),
    );
    expect(html).toContain("Moss the Mole");
    expect(html).toContain("/art/characters/looks/mole-male-russet.png");
    expect(html).not.toContain("/art/characters/npcs/practice-dummy.png");
    expect(encounterFoeVisual(duel, { peers: [{ id: "char-moss", visual }] })).toEqual(visual);
  });
});
