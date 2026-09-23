import { combatActionResolvedEventSchema } from "@greenwood/contracts";
import { describe, expect, it } from "vitest";
import { handleAttack } from "./attack.js";
import { handleCast } from "./cast.js";
import { handleDefend } from "./defend.js";
import { createPlayState } from "./play-state.js";
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
    presentationKey: "ember-burst",
    helpText: "cast ember",
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
        reads: ["brace", "gather", "lunge"],
      },
    },
    spells: { ember: ember() },
  };
}

function runtime(): EngineRuntime {
  let sequence = 0;
  let event = 0;
  return {
    now: () => new Date("2026-09-23T06:00:00.000Z"),
    nextEventId: () => `evt-read-${String((event += 1))}`,
    nextSequence: () => (sequence += 1),
    random: () => 0.5,
  };
}

describe("combat reads", () => {
  it("states the beat on the card and glances a stick while a spark lands", () => {
    const state = world();
    const clock = runtime();
    const started = handleAttack(
      state,
      { verb: "attack", characterId: "char-rowan", target: "dummy" },
      clock,
    );
    expect(started.ok && started.events[1]?.narration).toContain("sets their feet");
    expect(createPlayState(state, "char-rowan")?.encounter?.read).toContain("A spark does not");

    const stick = handleAttack(state, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(stick.ok).toBe(true);
    if (!stick.ok) {
      return;
    }
    const swung = combatActionResolvedEventSchema.parse(stick.events[0]);
    expect(swung.payload.damage).toBe(2);
    expect(swung.narration).toContain("The brace catches the stick.");
    expect(stick.events.some((event) => event.narration.includes("holds still"))).toBe(true);
    expect(state.characters["char-rowan"]?.health).toBe(20);

    const spark = handleCast(
      state,
      { verb: "cast", characterId: "char-rowan", spell: "ember" },
      clock,
    );
    expect(spark.ok).toBe(true);
    if (!spark.ok) {
      return;
    }
    const cast = spark.events.find((event) => event.type === "combat.action_resolved");
    expect(cast?.payload).toMatchObject({ damage: 5 });
    expect(cast?.narration).not.toContain("brace");
  });

  it("makes the next lean-in heavier when a draw-back is left alone", () => {
    const state = world();
    state.enemies!["enemy-practice-dummy-south-orchard"]!.reads = ["gather", "lunge"];
    const clock = runtime();
    handleAttack(state, { verb: "attack", characterId: "char-rowan", target: "dummy" }, clock);
    const waited = handleDefend(state, { verb: "defend", characterId: "char-rowan" }, clock);
    expect(
      waited.ok && waited.events.some((event) => event.narration.includes("finishes drawing back")),
    ).toBe(true);
    expect(state.enemies!["enemy-practice-dummy-south-orchard"]).toBeTruthy();
    const encounter = state.encounters?.[state.characters["char-rowan"]?.encounterId ?? ""];
    expect(encounter?.enemy.health).toBe(30);

    const answer = handleAttack(state, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(answer.ok).toBe(true);
    if (!answer.ok) {
      return;
    }
    const reply = answer.events.find(
      (event) => event.type === "combat.action_resolved" && event.payload.actorKind === "enemy",
    );
    expect(reply?.payload).toMatchObject({ damage: 4 });
    expect(state.characters["char-rowan"]?.health).toBe(16);
  });

  it("spoils a draw-back when the strike lands first", () => {
    const state = world();
    state.enemies!["enemy-practice-dummy-south-orchard"]!.reads = ["gather", "lunge"];
    const clock = runtime();
    handleAttack(state, { verb: "attack", characterId: "char-rowan", target: "dummy" }, clock);
    const caught = handleAttack(state, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(
      caught.ok && caught.events.some((event) => event.narration.includes("drawing back")),
    ).toBe(true);
    const answer = handleAttack(state, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(answer.ok).toBe(true);
    if (!answer.ok) {
      return;
    }
    const reply = answer.events.find(
      (event) => event.type === "combat.action_resolved" && event.payload.actorKind === "enemy",
    );
    expect(reply?.payload).toMatchObject({ damage: 2 });
    expect(state.characters["char-rowan"]?.health).toBe(18);
  });

  it("loads the next blow when a guard meets a lean-in", () => {
    const state = world();
    state.enemies!["enemy-practice-dummy-south-orchard"]!.reads = ["lunge"];
    const clock = runtime();
    handleAttack(state, { verb: "attack", characterId: "char-rowan", target: "dummy" }, clock);
    handleDefend(state, { verb: "defend", characterId: "char-rowan" }, clock);
    const loaded = handleAttack(state, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) {
      return;
    }
    const swing = combatActionResolvedEventSchema.parse(loaded.events[0]);
    expect(swing.payload.damage).toBe(6);
    expect(swing.narration).toContain("The loaded guard lands.");
  });
});
