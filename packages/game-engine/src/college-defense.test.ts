import { describe, expect, it } from "vitest";
import { startQuest } from "./arrival.js";
import {
  DEFENSE_MAX_MINUTES,
  alderCallNarration,
  cancelDefense,
  defenseFighting,
  defenseMinutes,
  defenseStatusLine,
  minutesLeft,
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
