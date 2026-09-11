import { describe, expect, it } from "vitest";
import { handleHelp } from "./help.js";
import { handleQuests } from "./quests.js";
import { ARRIVAL_QUEST_ID } from "./arrival.js";
import type { EngineRuntime, WorldState } from "./state.js";

function world(): WorldState {
  return {
    rooms: {
      "lantern-court": {
        id: "lantern-court",
        title: "Lantern Court",
        shortDescription: "A courtyard.",
        longDescription: "Blue lanterns drift.",
        zone: "academy-core",
        exits: [],
        fixtures: [],
      },
    },
    characters: {
      "char-rowan": {
        id: "char-rowan",
        name: "Rowan the Hare",
        roomId: "lantern-court",
        discoveredRoomIds: ["lantern-court"],
      },
    },
    questTemplates: {
      [ARRIVAL_QUEST_ID]: {
        id: ARRIVAL_QUEST_ID,
        title: "Arrival at the Collegium",
        introNarration: "Welcome.",
        reminderNarration: "Still here.",
        experienceReward: 10,
        objectives: [
          { id: "look", kind: "look", label: "Look around Lantern Court. Type look to see Lantern Court." },
          { id: "speak", kind: "say", label: "Say hello so Porter knows you arrived." },
        ],
      },
    },
    quests: {
      "char-rowan": {
        [ARRIVAL_QUEST_ID]: {
          questId: ARRIVAL_QUEST_ID,
          status: "active",
          completedObjectiveIds: ["look"],
          rewardGranted: false,
        },
      },
    },
  };
}

function runtime(): EngineRuntime {
  let sequence = 0;
  return {
    now: () => new Date("2026-09-07T21:00:00.000Z"),
    nextEventId: () => "evt-help",
    nextSequence: () => (sequence += 1),
  };
}

describe("help and quests", () => {
  it("lists implemented commands and explains look", () => {
    const listed = handleHelp(world(), { verb: "help", characterId: "char-rowan" }, runtime());
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      expect(listed.event.narration).toContain("look —");
      expect(listed.event.narration).toContain("say —");
      expect(listed.event.narration).toContain("help —");
      expect(listed.event.narration).toContain("quests —");
      expect(listed.event.narration).toContain("talk —");
      expect(listed.event.narration).toContain("where —");
      expect(listed.event.narration).toContain("stats —");
    }

    const topic = handleHelp(
      world(),
      { verb: "help", characterId: "char-rowan", topic: "look" },
      runtime(),
    );
    expect(topic.ok).toBe(true);
    if (topic.ok) {
      expect(topic.event.narration).toContain("look describes the room");
    }

    const unknown = handleHelp(
      world(),
      { verb: "help", characterId: "char-rowan", topic: "dance" },
      runtime(),
    );
    expect(unknown.ok).toBe(true);
    if (unknown.ok) {
      expect(unknown.event.narration).toContain("I do not have help for dance");
    }
    const talk = handleHelp(
      world(),
      { verb: "help", characterId: "char-rowan", topic: "talk" },
      runtime(),
    );
    expect(talk.ok && talk.event.narration).toContain("talk to Porter Bramble");
  });

  it("lists Arrival progress", () => {
    const result = handleQuests(world(), { verb: "quests", characterId: "char-rowan" }, runtime());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.event.narration).toContain("Arrival at the Collegium (active)");
      expect(result.event.presentationKey).toBe("quest.journal");
      expect(result.event.narration).toContain("Look around Lantern Court. Type look to see Lantern Court.");
      expect(result.event.narration).toContain("Say hello so Porter knows you arrived.");
    }
  });
});
