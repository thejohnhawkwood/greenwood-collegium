import { describe, expect, it } from "vitest";
import { startQuest } from "./arrival.js";
import {
  DEFENSE_MAX_MINUTES,
  RAIDER_TEMPLATE_ID,
  alderCallNarration,
  cancelDefense,
  clearDefenseSpawns,
  defenseAftermathLine,
  defenseFighting,
  defenseMinutes,
  defenseStatusLine,
  isDefenseSpawnId,
  minutesLeft,
  openDefenseGates,
  raidersPerGate,
  restoreDefense,
  settleDefense,
  startDefense,
} from "./college-defense.js";
import type { EngineRuntime, QuestTemplate, WorldState } from "./state.js";

const errand: QuestTemplate = {
  id: "the-borrowed-ink",
  title: "The Borrowed Ink",
  introNarration: "Fetch the ink.",
  reminderNarration: "Fetch the ink.",
  experienceReward: 20,
  itemRewardTemplateId: "ink-rag",
  objectives: [{ id: "fetch", kind: "take", itemTemplateId: "borrowed-ink", label: "Take it." }],
};

function runtime(now: Date): EngineRuntime {
  let sequence = 0;
  let events = 0;
  return {
    now: () => now,
    nextEventId: () => `evt-defense-${String((events += 1))}`,
    nextSequence: () => (sequence += 1),
  };
}

function world(): WorldState {
  return {
    rooms: {
      "lantern-court": {
        id: "lantern-court",
        title: "Lantern Court",
        shortDescription: "A court.",
        longDescription: "Lanterns.",
        zone: "academy-core",
        exits: [],
        fixtures: [],
      },
    },
    characters: {
      "char-rowan": {
        id: "char-rowan",
        name: "Rowan",
        roomId: "lantern-court",
        discoveredRoomIds: ["lantern-court"],
      },
    },
    questTemplates: { [errand.id]: errand },
  };
}

describe("college defense", () => {
  it("caps the clock at seven minutes and counts down", () => {
    expect(defenseMinutes(undefined)).toBe(DEFENSE_MAX_MINUTES);
    expect(defenseMinutes(99)).toBe(DEFENSE_MAX_MINUTES);
    expect(defenseMinutes(0)).toBe(1);
    expect(defenseMinutes(3)).toBe(3);

    const state = world();
    const start = new Date("2026-09-25T18:00:00.000Z");
    startDefense(state, { id: "d1", minutes: 7, now: start, startedByUsername: "arbird" });
    expect(minutesLeft(state.defense, start)).toBe(7);
    expect(minutesLeft(state.defense, new Date("2026-09-25T18:04:30.000Z"))).toBe(3);
    expect(defenseStatusLine(state.defense, start)).toContain("arbird");
  });

  it("closes itself when the clock runs out, even if no timer fired", () => {
    const state = world();
    const start = new Date("2026-09-25T18:00:00.000Z");
    startDefense(state, { id: "d1", minutes: 7, now: start });
    expect(defenseFighting(state, new Date("2026-09-25T18:06:00.000Z"))).toBe(true);
    expect(defenseFighting(state, new Date("2026-09-25T18:08:00.000Z"))).toBe(false);
    expect(state.defense?.phase).toBe("closed");
    expect(state.defense?.endsAt).toBeUndefined();
    expect(defenseStatusLine(state.defense, new Date())).toContain("closed");
  });

  it("pauses a new errand but never one already begun", () => {
    const state = world();
    const start = new Date("2026-09-25T18:00:00.000Z");
    const clock = runtime(start);
    startDefense(state, { id: "d1", minutes: 7, now: start });

    const refused = startQuest(state, "char-rowan", errand.id, clock);
    expect(refused).toHaveLength(1);
    expect(refused[0]?.narration).toContain("the yard first");
    expect(state.quests?.["char-rowan"]?.[errand.id]).toBeUndefined();

    // Once the yard is closed the same errand starts normally.
    cancelDefense(state);
    const started = startQuest(state, "char-rowan", errand.id, clock);
    expect(started.length).toBeGreaterThan(1);
    expect(state.quests?.["char-rowan"]?.[errand.id]?.status).toBe("active");

    // A defense called mid-errand does not disturb work already begun: the giver still
    // reminds you what you were doing rather than sending you to the yard.
    startDefense(state, { id: "d2", minutes: 7, now: start });
    const reminded = startQuest(state, "char-rowan", errand.id, clock);
    expect(reminded).toHaveLength(1);
    expect(reminded[0]?.narration).toBe(errand.reminderNarration);
    expect(state.quests?.["char-rowan"]?.[errand.id]?.status).toBe("active");
  });

  it("cancelling is the adults calling it off, not a rollback", () => {
    const state = world();
    const start = new Date("2026-09-25T18:00:00.000Z");
    startDefense(state, { id: "d1", minutes: 7, now: start });
    cancelDefense(state);
    expect(state.defense?.phase).toBe("closed");
    expect(state.defense?.id).toBe("d1");
  });

  it("resumes a defense across a restart, or closes one whose clock ran out", () => {
    const resumed = world();
    restoreDefense(
      resumed,
      { id: "d1", phase: "fighting", endsAt: "2026-09-25T18:07:00.000Z" },
      new Date("2026-09-25T18:03:00.000Z"),
    );
    expect(resumed.defense?.phase).toBe("fighting");
    expect(minutesLeft(resumed.defense, new Date("2026-09-25T18:03:00.000Z"))).toBe(4);

    const missed = world();
    restoreDefense(
      missed,
      { id: "d1", phase: "fighting", endsAt: "2026-09-25T18:07:00.000Z" },
      new Date("2026-09-25T19:00:00.000Z"),
    );
    expect(missed.defense?.phase).toBe("closed");

    const nothing = world();
    restoreDefense(nothing, undefined, new Date());
    expect(nothing.defense).toBeUndefined();
    expect(settleDefense(nothing, new Date())).toBeUndefined();
  });

  it("opens three gates from content, scales with the class, and keeps the night's ids apart", () => {
    const state = world();
    state.enemyTemplates = {
      [RAIDER_TEMPLATE_ID]: {
        templateId: RAIDER_TEMPLATE_ID,
        name: "Raider",
        examineDescription: "A grain sack and a pry-bar.",
        maxHealth: 12,
        maxFocus: 6,
        attack: 3,
        experience: 8,
        loot: ["raiders-token"],
      },
    };

    expect(raidersPerGate(0)).toBe(3);
    expect(raidersPerGate(4)).toBe(3);
    expect(raidersPerGate(30)).toBe(5);

    const made = openDefenseGates(state, { defenseId: "night-1", onlineCount: 30 });
    expect(made).toHaveLength(1);
    expect(made[0]?.roomId).toBe("lantern-court");
    // Stats come off the declared template, and the trophy rides the normal loot path.
    expect(made[0]).toMatchObject({ maxHealth: 12, attack: 3, loot: ["raiders-token"] });
    expect(made.every((spawn) => isDefenseSpawnId(spawn.id))).toBe(true);

    // Calling again the same night does not double the gates.
    expect(openDefenseGates(state, { defenseId: "night-1", onlineCount: 30 })).toEqual([]);

    // A second night mints different ids, so last night's win cannot pay again.
    const second = openDefenseGates(state, { defenseId: "night-2", onlineCount: 6 });
    expect(second).toHaveLength(1);
    expect(second.some((spawn) => made.some((first) => first.id === spawn.id))).toBe(false);

    // The porters clear every raider and leave the rest of the world alone.
    state.enemies = { ...state.enemies, "enemy-practice-dummy-south-orchard": made[0]! };
    expect(clearDefenseSpawns(state)).toBe(2);
    expect(Object.keys(state.enemies ?? {})).toEqual(["enemy-practice-dummy-south-orchard"]);
  });

  it("mints another wave the size of the Collegians still in the room", () => {
    const state = world();
    state.characters["char-wren"] = {
      id: "char-wren",
      name: "Wren",
      roomId: "lantern-court",
      discoveredRoomIds: ["lantern-court"],
    };
    state.enemyTemplates = {
      [RAIDER_TEMPLATE_ID]: {
        templateId: RAIDER_TEMPLATE_ID,
        name: "Raider",
        examineDescription: "A grain sack and a pry-bar.",
        maxHealth: 12,
        maxFocus: 6,
        attack: 3,
        experience: 8,
      },
    };
    startDefense(state, { id: "night-1", now: new Date("2026-09-25T18:00:00.000Z") });
    const first = openDefenseGates(state, { defenseId: "night-1", onlineCount: 2 });
    expect(first.filter((spawn) => spawn.templateId === RAIDER_TEMPLATE_ID)).toHaveLength(2);
    for (const spawn of first) {
      state.characters["char-rowan"]!.defeatedSpawnIds = [
        ...(state.characters["char-rowan"]!.defeatedSpawnIds ?? []),
        spawn.id,
      ];
      state.characters["char-wren"]!.defeatedSpawnIds = [
        ...(state.characters["char-wren"]!.defeatedSpawnIds ?? []),
        spawn.id,
      ];
    }
    const second = openDefenseGates(state, { defenseId: "night-1", onlineCount: 2 });
    expect(second.filter((spawn) => spawn.templateId === RAIDER_TEMPLATE_ID)).toHaveLength(2);
    expect(state.defense?.waves?.["lantern-court"]).toBe(2);
  });

  it("marks the gates the morning after without touching an exit", () => {
    const state = world();
    expect(defenseAftermathLine(state, "lantern-court")).toBeUndefined();

    startDefense(state, { id: "d1", minutes: 7, now: new Date("2026-09-25T18:00:00.000Z") });
    expect(defenseAftermathLine(state, "lantern-court")).toBeUndefined();

    cancelDefense(state);
    expect(defenseAftermathLine(state, "lantern-court")).toContain("lanterns is out");
    expect(defenseAftermathLine(state, "east-meadow")).toContain("clover is trampled");
    expect(defenseAftermathLine(state, "south-orchard")).toContain("Windfall apples");
    expect(defenseAftermathLine(state, "great-hall")).toBeUndefined();
    expect(state.rooms["lantern-court"]?.exits).toEqual([]);
  });

  it("names the three gates and says nobody is graded", () => {
    const line = alderCallNarration(7);
    expect(line).toContain("Lantern Court");
    expect(line).toContain("East Meadow");
    expect(line).toContain("South Orchard");
    expect(line).toContain("7 minutes");
    expect(line).toContain("Nobody is graded");
    expect(alderCallNarration(1)).toContain("a minute");
  });
});
