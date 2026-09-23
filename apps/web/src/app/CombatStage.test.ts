import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DEFAULT_APPEARANCE, schemaVersion, type EventEnvelope } from "@greenwood/contracts";
import { CombatStage } from "./CombatStage.js";
import { fxArtSrc } from "./combat-fx.js";
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

  it("shows both combatants, the latest narration, and a modal move menu", () => {
    const html = renderToStaticMarkup(
      createElement(CombatStage, {
        encounter,
        history: "You strike the Practice Dummy for 3.",
        player: {
          name: "Fern",
          visual: { speciesId: "fox", appearance: DEFAULT_APPEARANCE },
          health: 8,
          maxHealth: 20,
          focus: 4,
          maxFocus: 10,
        },
        onSend: () => {},
      }),
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("Fern");
    expect(html).toContain("Practice Dummy");
    expect(html).toContain("You strike the Practice Dummy for 3.");
    expect(html).toContain("1. Attack");
    expect(html).toContain("4. Flee");
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

  it("stacks a sword swing, impact, and shake on a damaging attack", () => {
    const html = renderToStaticMarkup(
      createElement(CombatStage, {
        encounter: { ...encounter, enemy: { ...encounter.enemy, health: 5 } },
        fxEvent: combatAction({ verb: "attack", damage: 3, targetHealth: 5 }),
        equipped: "Practice Sword",
        onSend: () => {},
      }),
    );
    expect(html).toContain(fxArtSrc("weapon-sword"));
    expect(html).toContain(fxArtSrc("impact-burst"));
    expect(html).toContain(fxArtSrc("wound-shred"));
    expect(html).toContain("is-shaking");
    expect(html).toContain("is-flinch");
    expect(html).toContain(npcArtSrc("enemy-practice-dummy-south-orchard"));
  });

  it("plays ember and bind on the still plate", () => {
    const ember = renderToStaticMarkup(
      createElement(CombatStage, {
        encounter: { ...encounter, enemy: { ...encounter.enemy, health: 3 } },
        fxEvent: combatAction({
          verb: "cast",
          damage: 5,
          targetHealth: 3,
          presentationKey: "ember-burst",
        }),
        onSend: () => {},
      }),
    );
    expect(ember).toContain(fxArtSrc("ember-burst"));
    expect(ember).toContain(fxArtSrc("wound-seep"));
    expect(ember).toContain("is-shaking");
    const bind = renderToStaticMarkup(
      createElement(CombatStage, {
        encounter,
        fxEvent: combatAction({
          verb: "cast",
          damage: 3,
          targetHealth: 8,
          presentationKey: "thorn-bind",
        }),
        onSend: () => {},
      }),
    );
    expect(bind).toContain(fxArtSrc("thorn-bind"));
    expect(bind).toContain("combat-fx-grow");
  });

  it("does not shake on defend and shows a skull at zero health", () => {
    const defend = renderToStaticMarkup(
      createElement(CombatStage, {
        encounter,
        fxEvent: combatAction({ verb: "defend", damage: 0 }),
        equipped: "Practice Sword",
        player: {
          name: "Fern",
          health: 8,
          maxHealth: 20,
          focus: 4,
          maxFocus: 10,
        },
        onSend: () => {},
      }),
    );
    expect(defend).not.toContain("is-shaking");
    expect(defend).not.toContain("weapon-sword");
    expect(defend).toContain("is-guard");
    const dead = renderToStaticMarkup(
      createElement(CombatStage, {
        encounter: { ...encounter, enemy: { ...encounter.enemy, health: 0 } },
        onSend: () => {},
      }),
    );
    expect(dead).toContain(fxArtSrc("defeat-skull"));
    expect(dead).toContain("is-defeated");
    expect(dead).toContain(fxArtSrc("wound-blacken"));
  });
});

function combatAction(input: {
  verb: "attack" | "cast" | "defend" | "flee";
  damage: number;
  targetHealth?: number;
  presentationKey?: string;
}): EventEnvelope {
  return {
    eventId: `evt-${input.verb}`,
    sequence: 1,
    schemaVersion,
    type: "combat.action_resolved",
    occurredAt: "2026-09-18T16:00:00.000Z",
    audience: "character",
    encounterId: "enc-1",
    narration: "A combat result.",
    presentationKey: input.presentationKey,
    payload: {
      encounterId: "enc-1",
      actorId: "char-1",
      actorName: "Fern",
      actorKind: "player",
      verb: input.verb,
      targetId: "enemy-practice-dummy-south-orchard",
      targetName: "Practice Dummy",
      damage: input.damage,
      targetHealth: input.targetHealth ?? 8,
      targetMaxHealth: 8,
    },
  };
}
