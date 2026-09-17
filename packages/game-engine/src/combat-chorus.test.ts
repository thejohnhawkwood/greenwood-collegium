import { describe, expect, it } from "vitest";
import { handleAttack } from "./attack.js";
import { handleCombatExpire } from "./combat-expire.js";
import { COMBAT_LOCK_MS } from "./combat-lock.js";
import { encounterMembers } from "./combat-party.js";
import { handleDefend } from "./defend.js";
import type { EngineRuntime, WorldState } from "./state.js";

function queenWorld(): WorldState {
  const room = {
    id: "deep-cradle",
    title: "Deep Cradle",
    shortDescription: "A still chamber.",
    longDescription: "Silk waits.",
    zone: "bell-below",
    exits: [],
    fixtures: [],
  };
  return {
    rooms: { "deep-cradle": room },
    characters: {
      "char-rowan": {
        id: "char-rowan",
        name: "Rowan",
        roomId: "deep-cradle",
        discoveredRoomIds: ["deep-cradle"],
      },
      "char-silo": {
        id: "char-silo",
        name: "Silo",
        roomId: "deep-cradle",
        discoveredRoomIds: ["deep-cradle"],
      },
      "char-newt": {
        id: "char-newt",
        name: "Newt",
        roomId: "deep-cradle",
        discoveredRoomIds: ["deep-cradle"],
      },
    },
    enemies: {
      "enemy-silk-queen-deep-cradle": {
        id: "enemy-silk-queen-deep-cradle",
        templateId: "silk-queen",
        name: "Silk Queen",
        examineDescription: "Three must stand.",
        roomId: "deep-cradle",
        maxHealth: 28,
        maxFocus: 12,
        attack: 5,
        experience: 20,
        minParty: 3,
      },
    },
  };
}

function orchardSolo(): WorldState {
  return {
    rooms: {
      "south-orchard": {
        id: "south-orchard",
        title: "South Orchard",
        shortDescription: "Apple trees.",
        longDescription: "Rows.",
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
      },
      "char-silo": {
        id: "char-silo",
        name: "Silo",
        roomId: "south-orchard",
        discoveredRoomIds: ["south-orchard"],
      },
    },
    enemies: {
      "enemy-practice-dummy-south-orchard": {
        id: "enemy-practice-dummy-south-orchard",
        templateId: "practice-dummy",
        name: "Practice Dummy",
        examineDescription: "Straw.",
        roomId: "south-orchard",
        maxHealth: 8,
        maxFocus: 6,
        attack: 2,
        experience: 5,
      },
    },
  };
}

function runtime(now = "2026-09-16T21:00:00.000Z"): EngineRuntime & { advance(ms: number): void } {
  let sequence = 0;
  let event = 0;
  let current = new Date(now);
  return {
    now: () => current,
    nextEventId: () => `evt-chorus-${String((event += 1))}`,
    nextSequence: () => (sequence += 1),
    random: () => 0.5,
    advance(ms: number) {
      current = new Date(current.getTime() + ms);
    },
  };
}

describe("party chorus and the Silk Queen", () => {
  it("refuses a queen fight when fewer than three Collegians stand", () => {
    const world = queenWorld();
    delete world.characters["char-silo"];
    delete world.characters["char-newt"];
    const started = handleAttack(
      world,
      { verb: "attack", characterId: "char-rowan", target: "queen" },
      runtime(),
    );
    expect(started).toMatchObject({
      ok: false,
      code: "party_too_small",
    });
    expect(world.characters["char-rowan"]?.encounterId).toBeUndefined();
  });

  it("lets three square up together and waits for every lock", () => {
    const world = queenWorld();
    const clock = runtime();
    const started = handleAttack(
      world,
      { verb: "attack", characterId: "char-rowan", target: "queen" },
      clock,
    );
    expect(started.ok).toBe(true);
    if (!started.ok) {
      return;
    }
    const encounter = world.encounters?.[world.characters["char-rowan"]?.encounterId ?? ""];
    expect(encounterMembers(encounter!)).toEqual(["char-rowan", "char-silo", "char-newt"]);
    expect(world.characters["char-silo"]?.encounterId).toBe(encounter?.id);
    expect(new Set(started.notices.map((notice) => notice.characterId))).toEqual(
      new Set(["char-newt", "char-silo"]),
    );

    const locked = handleAttack(world, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(locked.ok).toBe(true);
    if (!locked.ok) {
      return;
    }
    expect(locked.events[0]?.narration).toBe("You lock a move. Waiting for your classmates.");
    expect(encounter?.enemy.health).toBe(28);
    expect(encounter?.locked?.["char-rowan"]?.verb).toBe("attack");

    handleAttack(world, { verb: "attack", characterId: "char-silo" }, clock);
    const resolved = handleDefend(world, { verb: "defend", characterId: "char-newt" }, clock);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) {
      return;
    }
    expect(encounter?.enemy.health).toBeLessThan(28);
    expect(encounter?.round).toBe(2);
  });

  it("lets a late classmate join an open queen lesson", () => {
    const world = queenWorld();
    const clock = runtime();
    world.characters["char-newt"]!.roomId = "elsewhere";
    expect(
      handleAttack(world, { verb: "attack", characterId: "char-rowan", target: "queen" }, clock),
    ).toMatchObject({ ok: false, code: "party_too_small" });

    world.characters["char-newt"]!.roomId = "deep-cradle";
    const started = handleAttack(
      world,
      { verb: "attack", characterId: "char-rowan", target: "queen" },
      clock,
    );
    expect(started.ok).toBe(true);
    delete world.characters["char-newt"]!.encounterId;
    world.encounters![world.characters["char-rowan"]!.encounterId!].playerIds = [
      "char-rowan",
      "char-silo",
    ];
    const joined = handleAttack(
      world,
      { verb: "attack", characterId: "char-newt", target: "queen" },
      clock,
    );
    expect(joined.ok).toBe(true);
    expect(world.characters["char-newt"]?.encounterId).toBe(
      world.characters["char-rowan"]?.encounterId,
    );
  });

  it("fills missing locks with defend when the clock runs out", () => {
    const world = queenWorld();
    const clock = runtime();
    handleAttack(world, { verb: "attack", characterId: "char-rowan", target: "queen" }, clock);
    handleAttack(world, { verb: "attack", characterId: "char-rowan" }, clock);
    handleAttack(world, { verb: "attack", characterId: "char-silo" }, clock);
    clock.advance(COMBAT_LOCK_MS);
    const expired = handleCombatExpire(
      world,
      { verb: "combat-expire", characterId: "char-newt" },
      clock,
    );
    expect(expired.ok).toBe(true);
    if (!expired.ok) {
      return;
    }
    expect(expired.events[0]?.narration).toBe("The clock runs out. You raise a guard.");
    const encounter = world.encounters?.[world.characters["char-rowan"]?.encounterId ?? ""];
    expect(encounter?.enemy.health).toBeLessThan(28);
    expect(world.characters["char-newt"]?.defending).toBeUndefined();
  });

  it("opens the queen when one of three has not stood", () => {
    const world = queenWorld();
    const spawnId = "enemy-silk-queen-deep-cradle";
    world.characters["char-rowan"]!.defeatedSpawnIds = [spawnId];
    world.characters["char-silo"]!.defeatedSpawnIds = [spawnId];
    expect(
      handleAttack(
        world,
        { verb: "attack", characterId: "char-rowan", target: "queen" },
        runtime(),
      ),
    ).toMatchObject({ ok: true });
    expect(world.characters["char-newt"]?.encounterId).toBeDefined();
  });

  it("refuses the queen when every present Collegian has already stood", () => {
    const world = queenWorld();
    const spawnId = "enemy-silk-queen-deep-cradle";
    for (const id of ["char-rowan", "char-silo", "char-newt"] as const) {
      world.characters[id]!.defeatedSpawnIds = [spawnId];
    }
    expect(
      handleAttack(
        world,
        { verb: "attack", characterId: "char-rowan", target: "queen" },
        runtime(),
      ),
    ).toMatchObject({ ok: false, code: "foe_already_stood" });
  });

  it("keeps the dummy a solo immediate resolve", () => {
    const world = orchardSolo();
    const clock = runtime();
    handleAttack(world, { verb: "attack", characterId: "char-rowan", target: "dummy" }, clock);
    const swung = handleAttack(world, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(swung.ok).toBe(true);
    if (!swung.ok) {
      return;
    }
    expect(swung.events.some((event) => event.type === "combat.action_resolved")).toBe(true);
    expect(world.characters["char-silo"]?.encounterId).toBeUndefined();
    expect(
      world.encounters?.[world.characters["char-rowan"]?.encounterId ?? ""]?.enemy.health,
    ).toBe(4);
  });
});
