import {
  combatActionResolvedEventSchema,
  combatStatusAppliedEventSchema,
  renderClassicNarration,
} from "@greenwood/contracts";
import { describe, expect, it } from "vitest";
import { handleAttack } from "./attack.js";
import { handleCast } from "./cast.js";
import type { EngineRuntime, SpellTemplate, WorldState } from "./state.js";

function emberSpell(): SpellTemplate {
  return {
    id: "ember",
    name: "Ember",
    school: "ember",
    description: "A small taught flame.",
    focusCost: 4,
    targetType: "enemy",
    context: "encounter",
    damage: 5,
    burningRounds: 2,
    burningDamage: 1,
    presentationKey: "ember-burst",
    helpText: "cast ember",
  };
}

function orchardWorld(maxHealth = 8): WorldState {
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
      },
    },
    enemies: {
      "enemy-practice-dummy-south-orchard": {
        id: "enemy-practice-dummy-south-orchard",
        templateId: "practice-dummy",
        name: "Practice Dummy",
        examineDescription: "Straw and canvas.",
        roomId: "south-orchard",
        maxHealth,
        attack: 2,
        experience: 5,
      },
    },
    spells: { ember: emberSpell() },
  };
}

function runtime(): EngineRuntime {
  let sequence = 0;
  let event = 0;
  return {
    now: () => new Date("2026-09-07T20:00:00.000Z"),
    nextEventId: () => `evt-ember-${String((event += 1))}`,
    nextSequence: () => (sequence += 1),
    random: () => 0.5,
  };
}

describe("ember slice", () => {
  it("casts Ember with focus cost, fire damage, burning, and a presentation key", () => {
    const world = orchardWorld();
    const result = handleCast(
      world,
      { verb: "cast", characterId: "char-rowan", spell: "ember", target: "dummy" },
      runtime(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.outcome).toBe("ongoing");
    const ember = result.events.find((event) => event.type === "combat.action_resolved");
    expect(ember).toBeDefined();
    if (!ember) {
      return;
    }
    const parsed = combatActionResolvedEventSchema.parse(ember);
    expect(parsed.presentationKey).toBe("ember-burst");
    expect(parsed.payload).toMatchObject({
      verb: "cast",
      spellName: "Ember",
      focusSpent: 4,
      damage: 5,
      targetHealth: 3,
    });
    expect(renderClassicNarration(parsed)).toBe(
      "You cast Ember at the Practice Dummy for 5. It has 3 remaining.",
    );
    expect(renderClassicNarration(parsed).toLowerCase()).not.toContain("burst");
    const burning = result.events.find((event) => event.type === "combat.status_applied");
    expect(burning && combatStatusAppliedEventSchema.parse(burning).narration).toBe(
      "The Practice Dummy is burning (2 rounds).",
    );
    expect(world.characters["char-rowan"]?.focus).toBe(6);
  });

  it("ticks burning on the next exchange and explains it in plain text", () => {
    const world = orchardWorld(12);
    const clock = runtime();
    const first = handleCast(
      world,
      { verb: "cast", characterId: "char-rowan", spell: "ember", target: "dummy" },
      clock,
    );
    expect(first.ok).toBe(true);
    const second = handleAttack(world, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(second.ok).toBe(true);
    if (!second.ok) {
      return;
    }
    const tick = second.events.find(
      (event) =>
        event.type === "combat.status_applied" &&
        "phase" in event.payload &&
        event.payload.phase === "tick",
    );
    expect(tick).toBeDefined();
    if (!tick) {
      return;
    }
    expect(combatStatusAppliedEventSchema.parse(tick).narration).toContain("smoulders for 1");
    expect(
      world.encounters?.[world.characters["char-rowan"]?.encounterId ?? ""]?.enemy.health,
    ).toBe(2);
  });

  it("refuses an unknown spell and a third Ember without focus", () => {
    const world = orchardWorld();
    const clock = runtime();
    expect(
      handleCast(world, { verb: "cast", characterId: "char-rowan", spell: "mend" }, clock),
    ).toMatchObject({ ok: false, code: "unknown_spell" });
    expect(
      handleCast(world, { verb: "cast", characterId: "char-rowan", spell: "" }, clock),
    ).toMatchObject({ ok: false, code: "missing_spell" });
    expect(
      handleCast(world, { verb: "cast", characterId: "char-rowan", spell: "ember" }, clock),
    ).toMatchObject({ ok: false, code: "missing_target" });

    expect(
      handleCast(
        world,
        { verb: "cast", characterId: "char-rowan", spell: "ember", target: "dummy" },
        clock,
      ).ok,
    ).toBe(true);
    expect(
      handleCast(world, { verb: "cast", characterId: "char-rowan", spell: "ember" }, clock).ok,
    ).toBe(true);
    expect(
      handleCast(world, { verb: "cast", characterId: "char-rowan", spell: "ember" }, clock),
    ).toMatchObject({ ok: false, code: "not_enough_focus" });
    expect(world.characters["char-rowan"]?.focus).toBe(2);
  });
});
