import { describe, expect, it } from "vitest";
import { ARRIVAL_QUEST_ID, progressQuests, startArrivalQuest } from "./arrival.js";
import { handleExamine } from "./examine.js";
import { BELL_BELOW_QUEST_ID } from "./headmaster.js";
import { createPlayState } from "./play-state.js";
import { handleJoin } from "./presence.js";
import { handleLook } from "./look.js";
import { handleMove } from "./move.js";
import { handleSay } from "./say.js";
import { handleTalk } from "./talk.js";
import type { EngineRuntime, QuestTemplate, WorldState } from "./state.js";

const arrivalTemplate: QuestTemplate = {
  id: ARRIVAL_QUEST_ID,
  title: "Arrival at the Collegium",
  introNarration: "Porter waits.",
  reminderNarration: "Stay with Porter.",
  experienceReward: 10,
  objectives: [
    { id: "look", kind: "look", label: "Look around." },
    { id: "speak", kind: "say", label: "Say hello." },
    { id: "take", kind: "take", label: "Take the key.", itemTemplateId: "small-copper-key" },
    { id: "arrive", kind: "visit", label: "Reach the Great Hall.", roomId: "great-hall" },
  ],
};

function world(): WorldState {
  return {
    rooms: {
      "lantern-court": {
        id: "lantern-court",
        title: "Lantern Court",
        shortDescription: "A courtyard.",
        longDescription: "Lanterns.",
        zone: "academy-core",
        exits: [{ direction: "north", toRoomId: "great-hall" }],
        fixtures: [],
      },
      "great-hall": {
        id: "great-hall",
        title: "Great Hall",
        shortDescription: "A hall.",
        longDescription: "Oaks.",
        zone: "academy-core",
        exits: [
          { direction: "south", toRoomId: "lantern-court" },
          { direction: "up", toRoomId: "headmaster-study" },
        ],
        fixtures: [],
      },
      "headmaster-study": {
        id: "headmaster-study",
        title: "The High Study",
        shortDescription: "A study.",
        longDescription: "Moonlight and oak.",
        zone: "academy-core",
        exits: [{ direction: "down", toRoomId: "great-hall" }],
        fixtures: [
          {
            id: "npc-headmaster-alder",
            name: "Headmaster Alder",
            kind: "npc",
            dialogue: "Choose a School.",
            dialogueTree: {
              start: "welcome",
              nodes: {
                welcome: {
                  text: "Pick a School.",
                  choices: [
                    { say: "1", label: "School of Ember", next: "chosen-ember", school: "ember" },
                    { say: "6", label: "School of Steel", next: "chosen-steel", school: "steel" },
                  ],
                },
                "chosen-ember": { text: "Ember it is." },
                "chosen-steel": { text: "Steel it is." },
                "already-chosen": { text: "You have a School." },
                "offer-bell": {
                  text: "Help me with the bell.",
                  choices: [{ say: "1", label: "I will go.", next: "bell-active" }],
                },
                "bell-active": { text: "Examine the three places." },
                "bell-done": { text: "The wood remembers." },
              },
            },
          },
        ],
      },
      "clock-tower": {
        id: "clock-tower",
        title: "Clock Tower",
        shortDescription: "Gears.",
        longDescription: "An empty frame.",
        zone: "academy-core",
        exits: [{ direction: "west", toRoomId: "headmaster-study" }],
        fixtures: [
          {
            id: "object-empty-bell-frame",
            name: "Empty Bell Frame",
            kind: "object",
            examineDescription: "The frame is empty.",
          },
        ],
      },
      "archive-cellar": {
        id: "archive-cellar",
        title: "Archive Cellar",
        shortDescription: "Ledgers.",
        longDescription: "Dust and ink.",
        zone: "academy-core",
        exits: [{ direction: "south", toRoomId: "headmaster-study" }],
        fixtures: [
          {
            id: "object-bell-ledger",
            name: "Bell Ledger",
            kind: "object",
            examineDescription: "The keeper wrote the bell away.",
          },
        ],
      },
      "quiet-chapel": {
        id: "quiet-chapel",
        title: "Quiet Chapel",
        shortDescription: "Stone.",
        longDescription: "A root listens.",
        zone: "academy-core",
        exits: [{ direction: "east", toRoomId: "headmaster-study" }],
        fixtures: [
          {
            id: "object-listening-stone",
            name: "Listening Stone",
            kind: "object",
            examineDescription: "Three pulses.",
          },
        ],
      },
      "hearth-steel": {
        id: "hearth-steel",
        title: "Hearth of Steel",
        shortDescription: "Anvils.",
        longDescription: "Mail and iron.",
        zone: "schools",
        exits: [{ direction: "south", toRoomId: "headmaster-study" }],
        fixtures: [
          {
            id: "npc-mentor-edge",
            name: "Mentor Edge",
            kind: "npc",
            dialogue: "Train.",
            dialogueTree: {
              start: "welcome",
              nodes: {
                welcome: { text: "Look this hearth. Find Flint. Come back." },
              },
            },
          },
        ],
      },
    },
    characters: {},
    items: {},
    starterPlacements: [
      {
        id: "item-copper-key-lantern-court",
        templateId: "small-copper-key",
        name: "Small Copper Key",
        examineDescription: "A key.",
        roomId: "lantern-court",
      },
    ],
    questTemplates: {
      [ARRIVAL_QUEST_ID]: arrivalTemplate,
      "first-lessons-steel": {
        id: "first-lessons-steel",
        title: "First Lessons: Steel",
        introNarration: "Edge sets your first work.",
        reminderNarration: "Look the hearth. Visit the orchard. Talk Edge.",
        completionNarration: "Steel has your name.",
        experienceReward: 10,
        objectives: [
          { id: "look-hearth", kind: "look", label: "Look the hearth.", roomId: "hearth-steel" },
          {
            id: "visit-orchard",
            kind: "visit",
            label: "Visit the orchard.",
            roomId: "south-orchard",
            requires: ["look-hearth"],
          },
          {
            id: "report",
            kind: "talk",
            label: "Talk Edge.",
            targetId: "npc-mentor-edge",
            requires: ["visit-orchard"],
          },
        ],
      },
      [BELL_BELOW_QUEST_ID]: {
        id: BELL_BELOW_QUEST_ID,
        title: "The Bell Below",
        introNarration: "Alder sets down his tuning fork.",
        reminderNarration: "Examine the three places, then talk alder here.",
        completionNarration: "The wood remembers its welcome.",
        experienceReward: 15,
        objectives: [
          {
            id: "check-frame",
            kind: "examine",
            targetId: "object-empty-bell-frame",
            label: "Examine the Empty Bell Frame.",
          },
          {
            id: "read-ledger",
            kind: "examine",
            targetId: "object-bell-ledger",
            label: "Examine the Bell Ledger.",
          },
          {
            id: "listen",
            kind: "examine",
            targetId: "object-listening-stone",
            label: "Examine the Listening Stone.",
          },
          {
            id: "report",
            kind: "talk",
            targetId: "npc-headmaster-alder",
            requires: ["check-frame", "read-ledger", "listen"],
            label: "Talk alder in the High Study.",
          },
        ],
      },
    },
  };
}

function runtime(): EngineRuntime {
  let sequence = 0;
  let events = 0;
  return {
    now: () => new Date("2026-09-16T19:00:00.000Z"),
    nextEventId: () => `evt-study-${String((events += 1))}`,
    nextSequence: () => (sequence += 1),
  };
}

describe("headmaster study after Arrival", () => {
  it("teleports a finished Arrival into the High Study and opens school choices", () => {
    const realm = world();
    const clock = runtime();
    expect(
      handleJoin(
        realm,
        { verb: "join", characterId: "char-rowan", name: "Rowan", roomId: "lantern-court" },
        clock,
      ).ok,
    ).toBe(true);
    startArrivalQuest(realm, "char-rowan", clock);
    handleLook(realm, { verb: "look", characterId: "char-rowan" }, clock);
    progressQuests(realm, { characterId: "char-rowan", kind: "look" }, clock);
    handleSay(realm, { verb: "say", characterId: "char-rowan", text: "hello" }, clock);
    progressQuests(realm, { characterId: "char-rowan", kind: "say" }, clock);
    // Skip the take objective by marking it done so the visit can finish.
    realm.quests!["char-rowan"]![ARRIVAL_QUEST_ID]!.completedObjectiveIds.push("take");
    handleMove(realm, { verb: "move", characterId: "char-rowan", direction: "north" }, clock);
    const finished = progressQuests(realm, { characterId: "char-rowan", kind: "move" }, clock);
    expect(realm.characters["char-rowan"]?.roomId).toBe("headmaster-study");
    expect(finished.some((event) => event.narration.includes("High Study"))).toBe(true);
    expect(realm.characters["char-rowan"]?.openConversation).toEqual({
      npcId: "npc-headmaster-alder",
      nodeId: "welcome",
    });
    const snapshot = createPlayState(realm, "char-rowan");
    expect(snapshot?.conversation?.choices.map((choice) => choice.label)).toEqual([
      "School of Ember",
      "School of Steel",
    ]);
    const picked = handleSay(realm, { verb: "say", characterId: "char-rowan", text: "6" }, clock);
    expect(picked.ok).toBe(true);
    expect(realm.characters["char-rowan"]?.schoolId).toBe("steel");
    expect(realm.characters["char-rowan"]?.roomId).toBe("hearth-steel");
    expect(realm.characters["char-rowan"]?.openConversation).toEqual({
      npcId: "npc-mentor-edge",
      nodeId: "welcome",
    });
    expect(realm.quests?.["char-rowan"]?.["first-lessons-steel"]?.completedObjectiveIds).toEqual([
      "look-hearth",
    ]);
    realm.characters["char-rowan"]!.roomId = "headmaster-study";
    const again = handleTalk(
      realm,
      { verb: "talk", characterId: "char-rowan", target: "alder" },
      clock,
    );
    expect(again.ok).toBe(true);
    expect(realm.characters["char-rowan"]?.openConversation?.nodeId).toBe("already-chosen");
    expect(realm.quests?.["char-rowan"]?.[BELL_BELOW_QUEST_ID]).toBeUndefined();
  });

  it("starts the Bell Below only after first lessons, then finishes on the High Study report", () => {
    const realm = world();
    const clock = runtime();
    expect(
      handleJoin(
        realm,
        {
          verb: "join",
          characterId: "char-rowan",
          name: "Rowan",
          roomId: "headmaster-study",
          schoolId: "steel",
          experience: 20,
          level: 3,
        },
        clock,
      ).ok,
    ).toBe(true);
    const early = handleTalk(
      realm,
      { verb: "talk", characterId: "char-rowan", target: "alder" },
      clock,
    );
    expect(early.ok).toBe(true);
    expect(realm.characters["char-rowan"]?.openConversation?.nodeId).toBe("already-chosen");
    expect(realm.quests?.["char-rowan"]?.[BELL_BELOW_QUEST_ID]).toBeUndefined();

    realm.quests = {
      "char-rowan": {
        "first-lessons-steel": {
          questId: "first-lessons-steel",
          status: "completed",
          completedObjectiveIds: ["look-hearth", "visit-orchard", "report"],
          rewardGranted: true,
        },
      },
    };
    const offered = handleTalk(
      realm,
      { verb: "talk", characterId: "char-rowan", target: "alder" },
      clock,
    );
    expect(offered.ok).toBe(true);
    expect(realm.quests?.["char-rowan"]?.[BELL_BELOW_QUEST_ID]?.status).toBe("active");
    expect(realm.characters["char-rowan"]?.openConversation?.nodeId).toBe("offer-bell");
    expect(
      offered.ok && offered.events.some((event) => event.narration.includes("tuning fork")),
    ).toBe(true);
    const briefing = createPlayState(realm, "char-rowan");
    expect(briefing?.conversation?.choices.map((choice) => choice.label)).toEqual(["I will go."]);

    for (const [roomId, target, targetId] of [
      ["clock-tower", "frame", "object-empty-bell-frame"],
      ["archive-cellar", "ledger", "object-bell-ledger"],
      ["quiet-chapel", "stone", "object-listening-stone"],
    ] as const) {
      realm.characters["char-rowan"]!.roomId = roomId;
      expect(
        handleExamine(realm, { verb: "examine", characterId: "char-rowan", target }, clock).ok,
      ).toBe(true);
      progressQuests(realm, { characterId: "char-rowan", kind: "examine", targetId }, clock);
    }
    expect(realm.quests?.["char-rowan"]?.[BELL_BELOW_QUEST_ID]?.completedObjectiveIds).toEqual([
      "check-frame",
      "read-ledger",
      "listen",
    ]);
    realm.characters["char-rowan"]!.roomId = "headmaster-study";
    const reported = handleTalk(
      realm,
      { verb: "talk", characterId: "char-rowan", target: "alder" },
      clock,
    );
    expect(reported.ok).toBe(true);
    expect(realm.quests?.["char-rowan"]?.[BELL_BELOW_QUEST_ID]?.status).toBe("completed");
    expect(realm.characters["char-rowan"]?.openConversation?.nodeId).toBe("bell-done");
    expect(
      reported.ok && reported.events.some((event) => event.narration.includes("wood remembers")),
    ).toBe(true);
  });
});
