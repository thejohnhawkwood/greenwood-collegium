import { combatActionResolvedEventSchema, combatEndedEventSchema } from "@greenwood/contracts";
import { describe, expect, it } from "vitest";
import { handleAttack } from "./attack.js";
import { handleCombatExpire } from "./combat-expire.js";
import { COMBAT_LOCK_MS } from "./combat-lock.js";
import { handleDefend } from "./defend.js";
import { handleFlee } from "./flee.js";
import { createPlayState } from "./play-state.js";
import type { EngineRuntime, WorldState } from "./state.js";

function orchardWorld(): WorldState {
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
        maxHealth: 8,
        maxFocus: 6,
        attack: 2,
        experience: 5,
      },
    },
    spells: {
      ember: {
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
      },
    },
  };
}

function runtime(now = "2026-09-16T19:00:00.000Z", roll = 0.5): EngineRuntime {
  let sequence = 0;
  let event = 0;
  let current = new Date(now);
  return {
    now: () => current,
    nextEventId: () => `evt-lock-${String((event += 1))}`,
    nextSequence: () => (sequence += 1),
    random: () => roll,
    advance(ms: number) {
      current = new Date(current.getTime() + ms);
    },
  } as EngineRuntime & { advance(ms: number): void };
}

describe("lock-in combat", () => {
  it("opens a foe card with focus, a twelve-second lock, and legal moves", () => {
    const world = orchardWorld();
    const clock = runtime();
    const started = handleAttack(
      world,
      { verb: "attack", characterId: "char-rowan", target: "dummy" },
      clock,
    );
    expect(started.ok).toBe(true);
    if (!started.ok) {
      return;
    }
    expect(started.events.map((event) => event.type)).toEqual([
      "combat.started",
      "combat.turn_started",
    ]);
    const snapshot = createPlayState(world, "char-rowan");
    expect(snapshot?.encounter?.enemy).toMatchObject({
      name: "Practice Dummy",
      health: 8,
      maxHealth: 8,
      focus: 6,
      maxFocus: 6,
    });
    expect(snapshot?.encounter?.moves.map((move) => move.command)).toEqual([
      "attack",
      "cast ember",
      "defend",
      "flee",
    ]);
    expect(Date.parse(snapshot?.encounter?.lockDeadlineAt ?? "")).toBe(
      Date.parse("2026-09-16T19:00:00.000Z") + COMBAT_LOCK_MS,
    );
  });

  it("halves the reply when the student defends", () => {
    const world = orchardWorld();
    const clock = runtime();
    handleAttack(world, { verb: "attack", characterId: "char-rowan", target: "dummy" }, clock);
    const defended = handleDefend(world, { verb: "defend", characterId: "char-rowan" }, clock);
    expect(defended.ok).toBe(true);
    if (!defended.ok) {
      return;
    }
    expect(combatActionResolvedEventSchema.parse(defended.events[0]).narration).toBe(
      "You raise a guard.",
    );
    const reply = combatActionResolvedEventSchema.parse(defended.events[1]);
    expect(reply.payload.actorKind).toBe("enemy");
    expect(reply.payload.damage).toBe(1);
    expect(world.characters["char-rowan"]?.health).toBe(19);
  });

  it("lets a student flee without a harsh loss", () => {
    const world = orchardWorld();
    const clock = runtime();
    handleAttack(world, { verb: "attack", characterId: "char-rowan", target: "dummy" }, clock);
    const fled = handleFlee(world, { verb: "flee", characterId: "char-rowan" }, clock);
    expect(fled.ok).toBe(true);
    if (!fled.ok) {
      return;
    }
    expect(fled.outcome).toBe("fled");
    expect(combatEndedEventSchema.parse(fled.events[1]).payload.outcome).toBe("fled");
    expect(world.characters["char-rowan"]?.roomId).toBe("south-orchard");
    expect(world.characters["char-rowan"]?.encounterId).toBeUndefined();
  });

  it("auto-defends only after the lock window closes", () => {
    const world = orchardWorld();
    const clock = runtime() as EngineRuntime & { advance(ms: number): void };
    handleAttack(world, { verb: "attack", characterId: "char-rowan", target: "dummy" }, clock);
    expect(
      handleCombatExpire(world, { verb: "combat-expire", characterId: "char-rowan" }, clock),
    ).toMatchObject({
      ok: false,
      code: "lock_open",
    });
    clock.advance(COMBAT_LOCK_MS);
    const expired = handleCombatExpire(
      world,
      { verb: "combat-expire", characterId: "char-rowan" },
      clock,
    );
    expect(expired.ok).toBe(true);
    if (!expired.ok) {
      return;
    }
    expect(expired.events[0]?.narration).toBe("The clock runs out. You raise a guard.");
    expect(world.characters["char-rowan"]?.health).toBe(19);
  });
});
