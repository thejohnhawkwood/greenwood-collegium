import { describe, expect, it } from "vitest";
import { handleAttack } from "./attack.js";
import { handleCast } from "./cast.js";
import { createPlayState } from "./play-state.js";
import type { EngineRuntime, SpellTemplate, WorldState } from "./state.js";

function runtime(): EngineRuntime {
  let sequence = 0;
  let events = 0;
  return {
    now: () => new Date("2026-09-16T19:00:00.000Z"),
    nextEventId: () => `evt-kit-${String((events += 1))}`,
    nextSequence: () => (sequence += 1),
  };
}

function spell(template: SpellTemplate): SpellTemplate {
  return template;
}

function orchardWorld(): WorldState {
  return {
    rooms: {
      "south-orchard": {
        id: "south-orchard",
        title: "South Orchard",
        shortDescription: "Apple trees.",
        longDescription: "A dummy waits.",
        zone: "grounds",
        exits: [],
        fixtures: [],
      },
    },
    characters: {
      "char-rowan": {
        id: "char-rowan",
        name: "Rowan",
        roomId: "south-orchard",
        discoveredRoomIds: ["south-orchard"],
        schoolId: "steel",
        level: 3,
        health: 20,
        maxHealth: 20,
        focus: 10,
        maxFocus: 10,
      },
    },
    enemies: {
      "enemy-practice-dummy-south-orchard": {
        id: "enemy-practice-dummy-south-orchard",
        templateId: "practice-dummy",
        name: "Practice Dummy",
        examineDescription: "Straw.",
        roomId: "south-orchard",
        maxHealth: 20,
        attack: 2,
        experience: 1,
      },
    },
    spells: {
      strike: spell({
        id: "strike",
        name: "Strike",
        school: "steel",
        description: "A clean cut.",
        focusCost: 3,
        targetType: "enemy",
        context: "encounter",
        damage: 6,
        minLevel: 3,
        presentationKey: "steel-strike",
        helpText: "cast strike",
      }),
      riposte: spell({
        id: "riposte",
        name: "Riposte",
        school: "steel",
        description: "The answer after a hit.",
        focusCost: 3,
        targetType: "enemy",
        context: "encounter",
        damage: 7,
        effect: "riposte",
        minLevel: 3,
        presentationKey: "steel-riposte",
        helpText: "cast riposte",
      }),
      "ready-steel": spell({
        id: "ready-steel",
        name: "Ready Steel",
        school: "steel",
        description: "A held edge.",
        focusCost: 2,
        targetType: "self",
        context: "encounter",
        effect: "ready-strike",
        minLevel: 3,
        presentationKey: "ready-steel",
        helpText: "cast ready-steel",
      }),
      bind: spell({
        id: "bind",
        name: "Bind",
        school: "thorn",
        description: "Vines hold.",
        focusCost: 3,
        targetType: "enemy",
        context: "encounter",
        damage: 3,
        effect: "skip-counter",
        minLevel: 3,
        presentationKey: "thorn-bind",
        helpText: "cast bind",
      }),
      greenstitch: spell({
        id: "greenstitch",
        name: "Greenstitch",
        school: "thorn",
        description: "Leaf-work mends.",
        focusCost: 4,
        targetType: "self",
        context: "any",
        effect: "heal",
        heal: 6,
        minLevel: 3,
        presentationKey: "greenstitch",
        helpText: "cast greenstitch",
      }),
      "night-eye": spell({
        id: "night-eye",
        name: "Night-Eye",
        school: "stars",
        description: "A named path.",
        focusCost: 2,
        targetType: "self",
        context: "any",
        effect: "insight",
        insight: "The next turning is named.",
        minLevel: 3,
        presentationKey: "night-eye",
        helpText: "cast night-eye",
      }),
    },
  };
}

describe("level-three School kit", () => {
  it("exposes the Steel kit on play-state and refuses Riposte until a hit lands", () => {
    const world = orchardWorld();
    const clock = runtime();
    const snapshot = createPlayState(world, "char-rowan");
    expect(snapshot?.character.gift?.id).toBe("strike");
    expect(snapshot?.character.gifts.map((gift) => gift.id)).toEqual([
      "strike",
      "riposte",
      "ready-steel",
    ]);
    expect(
      handleCast(
        world,
        { verb: "cast", characterId: "char-rowan", spell: "riposte", target: "dummy" },
        clock,
      ),
    ).toMatchObject({ ok: false, code: "gift_locked" });
    expect(
      handleAttack(world, { verb: "attack", characterId: "char-rowan", target: "dummy" }, clock).ok,
    ).toBe(true);
    world.characters["char-rowan"]!.hitThisEncounter = true;
    expect(
      handleCast(
        world,
        { verb: "cast", characterId: "char-rowan", spell: "riposte", target: "dummy" },
        clock,
      ).ok,
    ).toBe(true);
  });

  it("lets Ready Steel weight the next swing and Bind skip a counter", () => {
    const world = orchardWorld();
    const clock = runtime();
    world.characters["char-rowan"]!.schoolId = "thorn";
    world.characters["char-rowan"]!.focus = 10;
    const bound = handleCast(
      world,
      { verb: "cast", characterId: "char-rowan", spell: "bind", target: "dummy" },
      clock,
    );
    expect(bound.ok).toBe(true);
    expect(
      bound.ok && bound.events.some((event) => event.narration.includes("cannot answer")),
    ).toBe(true);

    world.characters["char-rowan"]!.schoolId = "steel";
    world.characters["char-rowan"]!.focus = 10;
    expect(
      handleCast(world, { verb: "cast", characterId: "char-rowan", spell: "ready-steel" }, clock)
        .ok,
    ).toBe(true);
    expect(world.characters["char-rowan"]?.nextAttackBonus).toBe(1);
    const swing = handleAttack(world, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(swing.ok).toBe(true);
    expect(world.characters["char-rowan"]?.nextAttackBonus).toBeUndefined();
  });

  it("mends out of a fight and names an insight gift", () => {
    const world = orchardWorld();
    const clock = runtime();
    world.characters["char-rowan"]!.schoolId = "thorn";
    world.characters["char-rowan"]!.health = 8;
    const mend = handleCast(
      world,
      { verb: "cast", characterId: "char-rowan", spell: "greenstitch" },
      clock,
    );
    expect(mend.ok).toBe(true);
    expect(world.characters["char-rowan"]?.health).toBe(14);
    world.characters["char-rowan"]!.schoolId = "stars";
    world.characters["char-rowan"]!.focus = 10;
    const insight = handleCast(
      world,
      { verb: "cast", characterId: "char-rowan", spell: "night-eye" },
      clock,
    );
    expect(insight.ok).toBe(true);
    expect(insight.ok && insight.events.some((event) => event.narration.includes("turning"))).toBe(
      true,
    );
  });
});
