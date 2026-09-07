import {
  combatActionResolvedEventSchema,
  combatEndedEventSchema,
  experienceGainedEventSchema,
} from "@greenwood/contracts";
import { describe, expect, it } from "vitest";
import { handleAttack } from "./attack.js";
import { handleLeave } from "./presence.js";
import { handleLook } from "./look.js";
import { handleMove } from "./move.js";
import { handleTake } from "./take.js";
import { rollAttackDamage } from "./combat-state.js";
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
        exits: [{ direction: "north", toRoomId: "lantern-court" }],
        fixtures: [],
      },
      infirmary: {
        id: "infirmary",
        title: "Infirmary",
        shortDescription: "A quiet recovery room.",
        longDescription: "Clean cots line a sunlit wall.",
        zone: "academy-core",
        exits: [{ direction: "east", toRoomId: "lantern-court" }],
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
        attack: 2,
        experience: 5,
      },
    },
  };
}

function runtime(roll = 0.5): EngineRuntime {
  let sequence = 0;
  let event = 0;
  return {
    now: () => new Date("2026-09-07T19:00:00.000Z"),
    nextEventId: () => `evt-combat-${String((event += 1))}`,
    nextSequence: () => (sequence += 1),
    random: () => roll,
  };
}

describe("combat slice", () => {
  it("shows the dummy in look", () => {
    const world = orchardWorld();
    const looked = handleLook(world, { verb: "look", characterId: "char-rowan" }, runtime());
    expect(looked.ok).toBe(true);
    if (looked.ok) {
      expect(looked.event.narration).toContain("Practice Dummy");
    }
  });

  it("wins a deterministic two-round lesson and awards experience once", () => {
    const world = orchardWorld();
    const clock = runtime(0.5);
    const first = handleAttack(
      world,
      { verb: "attack", characterId: "char-rowan", target: "dummy" },
      clock,
    );
    expect(first.ok).toBe(true);
    if (!first.ok) {
      return;
    }
    expect(first.outcome).toBe("ongoing");
    expect(first.events.map((event) => event.type)).toEqual([
      "combat.started",
      "combat.turn_started",
      "combat.action_resolved",
      "combat.action_resolved",
      "combat.turn_started",
    ]);
    const playerHit = combatActionResolvedEventSchema.parse(first.events[2]);
    expect(playerHit.payload.damage).toBe(rollAttackDamage(4, 0.5));
    expect(playerHit.payload.targetHealth).toBe(4);
    expect(playerHit.narration).toBe("You strike the Practice Dummy for 4. It has 4 remaining.");

    const second = handleAttack(world, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(second.ok).toBe(true);
    if (!second.ok) {
      return;
    }
    expect(second.outcome).toBe("victory");
    expect(second.events.map((event) => event.type)).toEqual([
      "combat.action_resolved",
      "combat.ended",
      "progress.experience_gained",
    ]);
    expect(combatEndedEventSchema.parse(second.events[1]).payload.outcome).toBe("victory");
    expect(experienceGainedEventSchema.parse(second.events[2]).payload).toMatchObject({
      amount: 5,
      total: 5,
    });
    expect(world.characters["char-rowan"]?.experience).toBe(5);
    expect(world.characters["char-rowan"]?.encounterId).toBeUndefined();

    const third = handleAttack(
      world,
      { verb: "attack", characterId: "char-rowan", target: "dummy" },
      clock,
    );
    expect(third.ok).toBe(true);
    if (third.ok) {
      expect(third.events.some((event) => event.type === "combat.started")).toBe(true);
      expect(world.characters["char-rowan"]?.experience).toBe(5);
    }
  });

  it("uses the injected roll so a low roll deals less damage", () => {
    const world = orchardWorld();
    const first = handleAttack(
      world,
      { verb: "attack", characterId: "char-rowan", target: "dummy" },
      runtime(0),
    );
    expect(first.ok).toBe(true);
    if (!first.ok) {
      return;
    }
    const playerHit = combatActionResolvedEventSchema.parse(first.events[2]);
    expect(playerHit.payload.damage).toBe(3);
    expect(playerHit.payload.targetHealth).toBe(5);
  });

  it("returns the student to the Infirmary on defeat and keeps inventory", () => {
    const world = orchardWorld();
    const dummy = world.enemies?.["enemy-practice-dummy-south-orchard"];
    if (!dummy) {
      throw new Error("expected dummy");
    }
    dummy.attack = 25;
    dummy.maxHealth = 40;
    world.items = {
      "item-copper-key-lantern-court": {
        id: "item-copper-key-lantern-court",
        templateId: "small-copper-key",
        name: "Small Copper Key",
        examineDescription: "The bow is worn smooth.",
        holderCharacterId: "char-rowan",
      },
    };

    const result = handleAttack(
      world,
      { verb: "attack", characterId: "char-rowan", target: "dummy" },
      runtime(0.5),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.outcome).toBe("defeat");
    expect(result.roomId).toBe("infirmary");
    const ended = result.events.find((event) => event.type === "combat.ended");
    expect(ended && combatEndedEventSchema.parse(ended).narration).toBe(
      "The lesson ends. You wake in the Infirmary, unhurt.",
    );
    expect(result.events.some((event) => event.type === "room.snapshot")).toBe(true);
    const character = world.characters["char-rowan"];
    expect(character?.roomId).toBe("infirmary");
    expect(character?.health).toBe(20);
    expect(character?.encounterId).toBeUndefined();
    expect(world.items["item-copper-key-lantern-court"]?.holderCharacterId).toBe("char-rowan");
  });

  it("blocks movement and taking during a lesson", () => {
    const world = orchardWorld();
    const started = handleAttack(
      world,
      { verb: "attack", characterId: "char-rowan", target: "dummy" },
      runtime(),
    );
    expect(started.ok).toBe(true);

    const moved = handleMove(
      world,
      { verb: "move", characterId: "char-rowan", direction: "north" },
      runtime(),
    );
    expect(moved).toMatchObject({ ok: false, code: "in_combat" });

    const taken = handleTake(
      world,
      { verb: "take", characterId: "char-rowan", target: "key" },
      runtime(),
    );
    expect(taken).toMatchObject({ ok: false, code: "in_combat" });
  });

  it("refuses a second student the busy dummy, then frees it on leave", () => {
    const world = orchardWorld();
    world.characters["char-moss"] = {
      id: "char-moss",
      name: "Moss the Mole",
      roomId: "south-orchard",
      discoveredRoomIds: ["south-orchard"],
    };
    const first = handleAttack(
      world,
      { verb: "attack", characterId: "char-rowan", target: "dummy" },
      runtime(),
    );
    expect(first.ok).toBe(true);

    const blocked = handleAttack(
      world,
      { verb: "attack", characterId: "char-moss", target: "dummy" },
      runtime(),
    );
    expect(blocked).toMatchObject({ ok: false, code: "foe_busy" });

    const left = handleLeave(world, { verb: "leave", characterId: "char-rowan" }, runtime());
    expect(left.ok).toBe(true);

    const moss = handleAttack(
      world,
      { verb: "attack", characterId: "char-moss", target: "dummy" },
      runtime(),
    );
    expect(moss.ok).toBe(true);
  });

  it("does not allow fighting students or missing foes", () => {
    const world = orchardWorld();
    world.characters["char-moss"] = {
      id: "char-moss",
      name: "Moss the Mole",
      roomId: "south-orchard",
      discoveredRoomIds: ["south-orchard"],
    };

    expect(
      handleAttack(world, { verb: "attack", characterId: "char-rowan" }, runtime()),
    ).toMatchObject({ ok: false, code: "missing_target" });
    expect(
      handleAttack(world, { verb: "attack", characterId: "char-rowan", target: "moss" }, runtime()),
    ).toMatchObject({ ok: false, code: "no_pvp" });
    expect(
      handleAttack(
        world,
        { verb: "attack", characterId: "char-rowan", target: "porter" },
        runtime(),
      ),
    ).toMatchObject({ ok: false, code: "foe_not_found" });
  });
});
