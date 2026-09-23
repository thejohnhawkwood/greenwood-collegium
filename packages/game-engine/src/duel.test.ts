import { describe, expect, it } from "vitest";
import { handleAttack } from "./attack.js";
import { handleCast } from "./cast.js";
import { handleDefend } from "./defend.js";
import { handleDuel } from "./duel.js";
import { createPlayState } from "./play-state.js";
import { parsePlayerCommand } from "./parse-command.js";
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
      "char-moss": {
        id: "char-moss",
        name: "Moss the Mole",
        roomId: "south-orchard",
        discoveredRoomIds: ["south-orchard"],
      },
    },
  };
}

function runtime(): EngineRuntime {
  let sequence = 0;
  let event = 0;
  return {
    now: () => new Date("2026-09-16T19:00:00.000Z"),
    nextEventId: () => `evt-duel-${String((event += 1))}`,
    nextSequence: () => (sequence += 1),
    random: () => 0.5,
  };
}

describe("classroom duels", () => {
  it("parses duel challenge, accept, and decline", () => {
    expect(parsePlayerCommand("duel moss", "char-rowan")).toEqual({
      verb: "duel",
      characterId: "char-rowan",
      action: "challenge",
      target: "moss",
    });
    expect(parsePlayerCommand("duel accept", "char-moss")?.action).toBe("accept");
    expect(parsePlayerCommand("decline", "char-moss")?.action).toBe("decline");
  });

  it("refuses an attack on a classmate until both agree", () => {
    const world = orchardWorld();
    expect(
      handleAttack(world, { verb: "attack", characterId: "char-rowan", target: "moss" }, runtime()),
    ).toMatchObject({ ok: false, code: "no_pvp" });
  });

  it("starts a duel only after the classmate accepts", () => {
    const world = orchardWorld();
    const clock = runtime();
    const asked = handleDuel(
      world,
      { verb: "duel", characterId: "char-rowan", action: "challenge", target: "moss" },
      clock,
    );
    expect(asked.ok).toBe(true);
    expect(world.duelChallenges?.["char-moss"]?.fromId).toBe("char-rowan");
    const state = createPlayState(world, "char-moss");
    expect(state?.conversation?.npcId).toBe("duel-challenge");
    expect(state?.conversation?.choices.map((choice) => choice.label)).toEqual([
      "Accept the duel",
      "Decline",
    ]);

    const declined = handleDuel(
      world,
      { verb: "duel", characterId: "char-moss", action: "decline" },
      clock,
    );
    expect(declined.ok).toBe(true);
    expect(world.duelChallenges?.["char-moss"]).toBeUndefined();

    handleDuel(
      world,
      { verb: "duel", characterId: "char-rowan", action: "challenge", target: "moss" },
      clock,
    );
    const accepted = handleDuel(
      world,
      { verb: "duel", characterId: "char-moss", action: "accept" },
      clock,
    );
    expect(accepted.ok).toBe(true);
    if (!accepted.ok) {
      return;
    }
    expect(accepted.outcome).toBe("ongoing");
    expect(world.characters["char-rowan"]?.encounterId).toBeDefined();
    expect(world.characters["char-moss"]?.encounterId).toBeDefined();
    const mossState = createPlayState(world, "char-moss");
    expect(mossState?.encounter?.enemy.name).toBe("Rowan the Hare");
    const rowanState = createPlayState(world, "char-rowan");
    expect(rowanState?.encounter?.enemy.name).toBe("Moss the Mole");

    const swing = handleAttack(world, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(swing.ok).toBe(true);
    expect(world.characters["char-moss"]?.health).toBe(20);
    const locked = handleAttack(world, { verb: "attack", characterId: "char-moss" }, clock);
    expect(locked.ok).toBe(true);
    expect(world.characters["char-rowan"]?.health).toBe(18);
    expect(world.characters["char-moss"]?.health).toBe(18);
    expect(locked.ok && locked.events.some((event) => event.narration.includes("You mirror each other."))).toBe(
      true,
    );
    expect(createPlayState(world, "char-rowan")?.encounter?.read).toContain("same lesson twice");
  });

  it("covers a classmate's spark and loads the defender's next blow", () => {
    const world = orchardWorld();
    world.spells = {
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
    };
    const clock = runtime();
    handleDuel(world, { verb: "duel", characterId: "char-rowan", action: "challenge", target: "moss" }, clock);
    handleDuel(world, { verb: "duel", characterId: "char-moss", action: "accept" }, clock);
    handleCast(world, { verb: "cast", characterId: "char-rowan", spell: "ember" }, clock);
    const covered = handleDefend(world, { verb: "defend", characterId: "char-moss" }, clock);
    expect(covered.ok).toBe(true);
    expect(world.characters["char-moss"]?.health).toBe(18);
    expect(world.characters["char-rowan"]?.health).toBe(20);
    expect(
      covered.ok && covered.events.some((event) => event.narration.includes("Their guard covers the blow.")),
    ).toBe(true);

    handleAttack(world, { verb: "attack", characterId: "char-moss" }, clock);
    const answered = handleDefend(world, { verb: "defend", characterId: "char-rowan" }, clock);
    expect(answered.ok).toBe(true);
    if (!answered.ok) {
      return;
    }
    const loaded = answered.events.find((event) => event.narration.includes("Their guard covers the blow."));
    expect(loaded?.payload).toMatchObject({ damage: 3 });
    expect(world.characters["char-rowan"]?.health).toBe(17);
  });
});
