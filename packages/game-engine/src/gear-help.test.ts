import { describe, expect, it } from "vitest";
import { handleAttack } from "./attack.js";
import { handleCast } from "./cast.js";
import { closeEncounter } from "./combat-state.js";
import { wearRewardPhrase } from "./gear-help.js";
import type { EngineRuntime, SpellTemplate, WorldState } from "./state.js";

function ember(): SpellTemplate {
  return {
    id: "ember",
    name: "Ember",
    school: "ember",
    description: "A small taught flame.",
    focusCost: 4,
    targetType: "enemy",
    context: "encounter",
    damage: 5,
    helpText: "cast ember",
  };
}

function mend(): SpellTemplate {
  return {
    id: "mend",
    name: "Mend",
    school: "thorn",
    description: "A small mend.",
    focusCost: 4,
    targetType: "self",
    context: "any",
    effect: "heal",
    heal: 1,
    helpText: "cast mend",
  };
}

function world(): WorldState {
  return {
    rooms: {
      "south-orchard": {
        id: "south-orchard",
        title: "South Orchard",
        shortDescription: "Apple trees.",
        longDescription: "Low apple trees stand in careful rows.",
        zone: "grounds",
        exits: [],
        fixtures: [],
      },
    },
    characters: {
      "char-rowan": {
        id: "char-rowan",
        name: "Rowan the Hare",
        roomId: "south-orchard",
        discoveredRoomIds: ["south-orchard"],
        knownSpells: [{ spellId: "mend", rank: 1, pennedBy: "Briar" }],
      },
    },
    enemies: {
      "enemy-practice-dummy-south-orchard": {
        id: "enemy-practice-dummy-south-orchard",
        templateId: "practice-dummy",
        name: "Practice Dummy",
        examineDescription: "Straw and canvas.",
        roomId: "south-orchard",
        maxHealth: 30,
        attack: 2,
        experience: 0,
      },
    },
    spells: { ember: ember(), mend: mend() },
  };
}

function runtime(): EngineRuntime {
  let sequence = 0;
  let event = 0;
  return {
    now: () => new Date("2026-09-23T12:00:00.000Z"),
    nextEventId: () => `evt-gear-${String((event += 1))}`,
    nextSequence: () => (sequence += 1),
    random: () => 0.5,
  };
}

describe("paper-doll helps", () => {
  it("names a wearable reward from the template slot", () => {
    expect(wearRewardPhrase("cloak")).toBe("a cloak you can wear");
    expect(wearRewardPhrase("gloves")).toBe("gloves you can wear");
    expect(wearRewardPhrase(undefined)).toBeUndefined();
  });

  it("reduces only the first incoming hit, even with two guard pieces", () => {
    const state = world();
    const rowan = state.characters["char-rowan"];
    if (!rowan) throw new Error("missing rowan");
    rowan.equipment = { cloak: "wool", helmet: "cap" };
    const clock = runtime();
    handleAttack(state, { verb: "attack", characterId: "char-rowan", target: "dummy" }, clock);
    handleAttack(state, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(rowan.health).toBe(19);
    handleAttack(state, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(rowan.health).toBe(17);
  });

  it("does not guard a Collegian in boots alone", () => {
    const state = world();
    const rowan = state.characters["char-rowan"];
    if (!rowan) throw new Error("missing rowan");
    rowan.equipment = { boots: "path", ranged: "sling" };
    const clock = runtime();
    handleAttack(state, { verb: "attack", characterId: "char-rowan", target: "dummy" }, clock);
    handleAttack(state, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(rowan.health).toBe(18);
  });

  it("discounts the first cast of a fight and leaves the next cast full price", () => {
    const state = world();
    const rowan = state.characters["char-rowan"];
    if (!rowan) throw new Error("missing rowan");
    rowan.equipment = { gloves: "mitts", "ring-1": "glass" };
    const clock = runtime();
    handleCast(
      state,
      { verb: "cast", characterId: "char-rowan", spell: "ember", target: "dummy" },
      clock,
    );
    const first = handleCast(
      state,
      { verb: "cast", characterId: "char-rowan", spell: "ember" },
      clock,
    );
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    const spent = first.events.find((event) => event.type === "combat.action_resolved");
    expect(spent?.payload).toMatchObject({ focusSpent: 3 });
    expect(rowan.focus).toBe(7);
    const second = handleCast(
      state,
      { verb: "cast", characterId: "char-rowan", spell: "ember" },
      clock,
    );
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    const again = second.events.find((event) => event.type === "combat.action_resolved");
    expect(again?.payload).toMatchObject({ focusSpent: 4 });
  });

  it("does not discount a cast outside a fight", () => {
    const state = world();
    const rowan = state.characters["char-rowan"];
    if (!rowan) throw new Error("missing rowan");
    rowan.equipment = { necklace: "bead" };
    rowan.health = 10;
    const result = handleCast(
      state,
      { verb: "cast", characterId: "char-rowan", spell: "mend" },
      runtime(),
    );
    expect(result.ok).toBe(true);
    expect(rowan.focus).toBe(6);
  });

  it("offers the guard again after the fight ends", () => {
    const state = world();
    const rowan = state.characters["char-rowan"];
    if (!rowan) throw new Error("missing rowan");
    rowan.equipment = { armor: "linen" };
    const clock = runtime();
    handleAttack(state, { verb: "attack", characterId: "char-rowan", target: "dummy" }, clock);
    handleAttack(state, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(rowan.health).toBe(19);
    const encounter = state.encounters?.[rowan.encounterId ?? ""];
    if (!encounter) throw new Error("missing encounter");
    closeEncounter(state, encounter);
    rowan.encounterId = undefined;
    handleAttack(state, { verb: "attack", characterId: "char-rowan", target: "dummy" }, clock);
    handleAttack(state, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(rowan.health).toBe(18);
  });
});
