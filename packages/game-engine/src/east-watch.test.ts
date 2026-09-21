import { describe, expect, it } from "vitest";
import { progressQuests, startQuest } from "./arrival.js";
import {
  BARROW_MOUTH_QUEST_ID,
  FEN_NPC_ID,
  FOG_TOOK_QUEST_ID,
  MEADOW_FORK_QUEST_ID,
  QUILL_NPC_ID,
  STONES_QUEST_ID,
  UNCOUNTED_FLOCK_QUEST_ID,
  WREN_NPC_ID,
} from "./east-watch.js";
import { HEADMASTER_NPC_ID, STILL_SLEEPS_QUEST_ID } from "./headmaster.js";
import { handleTalk } from "./talk.js";
import type { EngineRuntime, QuestTemplate, WorldState } from "./state.js";

function runtime(): EngineRuntime {
  let sequence = 0;
  let events = 0;
  return {
    now: () => new Date("2026-09-20T19:00:00.000Z"),
    nextEventId: () => `evt-watch-${String((events += 1))}`,
    nextSequence: () => (sequence += 1),
  };
}

const meadowFork: QuestTemplate = {
  id: MEADOW_FORK_QUEST_ID,
  title: "The Meadow Fork",
  giverNpcId: WREN_NPC_ID,
  requiresQuestIds: [STILL_SLEEPS_QUEST_ID],
  introNarration: "Sit. Eat.",
  reminderNarration: "Examine the waystone.",
  completionNarration: "The fold is east.",
  experienceReward: 25,
  objectives: [
    { id: "walk-track", kind: "visit", roomId: "moor-track", label: "Reach the track." },
    { id: "hear-wren", kind: "talk", targetId: WREN_NPC_ID, label: "Talk wren." },
    {
      id: "read-waystone",
      kind: "examine",
      targetId: "object-waystone",
      label: "Examine the waystone.",
    },
    {
      id: "report",
      kind: "talk",
      targetId: WREN_NPC_ID,
      requires: ["walk-track", "hear-wren", "read-waystone"],
      label: "Talk wren again.",
    },
  ],
};

const uncounted: QuestTemplate = {
  id: UNCOUNTED_FLOCK_QUEST_ID,
  title: "The Uncounted Flock",
  giverNpcId: WREN_NPC_ID,
  requiresQuestIds: [MEADOW_FORK_QUEST_ID],
  introNarration: "East is the fold.",
  reminderNarration: "Examine the fold.",
  experienceReward: 25,
  objectives: [{ id: "reach-fold", kind: "visit", roomId: "sheepfold", label: "Reach the fold." }],
};

const thirdLessons: QuestTemplate = {
  id: "third-lessons-steel",
  title: "Alder's Leave: Steel",
  introNarration: "Talk Alder.",
  reminderNarration: "Talk Alder, then Edge.",
  experienceReward: 25,
  objectives: [
    {
      id: "talk-alder",
      kind: "talk",
      targetId: HEADMASTER_NPC_ID,
      label: "Talk to Headmaster Alder.",
    },
    {
      id: "report",
      kind: "talk",
      targetId: "npc-mentor-edge",
      requires: ["talk-alder"],
      label: "Talk Edge.",
    },
  ],
};

function world(): WorldState {
  return {
    rooms: {
      "headmaster-study": {
        id: "headmaster-study",
        title: "The High Study",
        shortDescription: "A study.",
        longDescription: "Oak.",
        zone: "academy-core",
        exits: [],
        fixtures: [
          {
            id: HEADMASTER_NPC_ID,
            name: "Headmaster Alder",
            kind: "npc",
            dialogue: "Facts.",
            dialogueTree: {
              start: "sleeps-done",
              nodes: {
                "sleeps-done": { text: "Eat something warm." },
                "offer-moor": { text: "North from the meadow." },
                "moor-active": { text: "Talk wren." },
                "watch-active": { text: "Wren has you." },
              },
            },
          },
        ],
      },
      "wren-croft": {
        id: "wren-croft",
        title: "Wren's Croft",
        shortDescription: "A croft.",
        longDescription: "Peat and kettle.",
        zone: "east-moor",
        exits: [{ direction: "south", toRoomId: "moor-track" }],
        fixtures: [
          {
            id: WREN_NPC_ID,
            name: "Shepherd Wren",
            kind: "npc",
            dialogue: "Sit.",
            dialogueTree: {
              start: "welcome",
              nodes: {
                welcome: { text: "Sit. Eat." },
                "fork-done": { text: "The fold is east." },
                "barrow-done": { text: "Examine what the fog took." },
                "after-colm": { text: "Go to Fen." },
                stay: { text: "The kettle is for the living." },
              },
            },
          },
        ],
      },
      "moor-track": {
        id: "moor-track",
        title: "Moor Track",
        shortDescription: "A track.",
        longDescription: "Wet wool.",
        zone: "east-moor",
        exits: [{ direction: "north", toRoomId: "wren-croft" }],
        fixtures: [
          {
            id: "object-waystone",
            name: "Waystone",
            kind: "object",
            examineDescription: "Three circles.",
          },
        ],
      },
      sheepfold: {
        id: "sheepfold",
        title: "Sheepfold",
        shortDescription: "A fold.",
        longDescription: "Empty.",
        zone: "east-moor",
        exits: [],
        fixtures: [],
      },
      infirmary: {
        id: "infirmary",
        title: "Infirmary",
        shortDescription: "Honey.",
        longDescription: "Soap and rosemary.",
        zone: "lodgings",
        exits: [],
        fixtures: [
          {
            id: FEN_NPC_ID,
            name: "Healer Fen",
            kind: "npc",
            dialogue: "Sit.",
            dialogueTree: {
              start: "welcome",
              nodes: {
                welcome: { text: "Sit if you need to." },
                "after-colm": { text: "Honey first." },
              },
            },
          },
        ],
      },
    },
    characters: {},
    questTemplates: {
      [STILL_SLEEPS_QUEST_ID]: {
        id: STILL_SLEEPS_QUEST_ID,
        title: "What Still Sleeps",
        introNarration: "Three can stand.",
        reminderNarration: "Defeat the queen.",
        experienceReward: 20,
        objectives: [
          {
            id: "defeat-queen",
            kind: "defeat",
            targetId: "enemy-silk-queen-deep-cradle",
            label: "Defeat the queen.",
          },
        ],
      },
      "third-lessons-steel": thirdLessons,
      [MEADOW_FORK_QUEST_ID]: meadowFork,
      [UNCOUNTED_FLOCK_QUEST_ID]: uncounted,
    },
  };
}

describe("East Watch chain", () => {
  it("does not let Wren start the moor road before Sleeps and Alder's leave", () => {
    const realm = world();
    const clock = runtime();
    realm.characters["char-rowan"] = {
      id: "char-rowan",
      name: "Rowan",
      roomId: "wren-croft",
      discoveredRoomIds: ["wren-croft"],
      schoolId: "steel",
    };
    expect(
      handleTalk(realm, { verb: "talk", characterId: "char-rowan", target: "wren" }, clock).ok,
    ).toBe(true);
    expect(realm.quests?.["char-rowan"]?.[MEADOW_FORK_QUEST_ID]).toBeUndefined();

    realm.quests = {
      "char-rowan": {
        [STILL_SLEEPS_QUEST_ID]: {
          questId: STILL_SLEEPS_QUEST_ID,
          status: "completed",
          completedObjectiveIds: ["defeat-queen"],
          rewardGranted: true,
        },
      },
    };
    expect(
      handleTalk(realm, { verb: "talk", characterId: "char-rowan", target: "wren" }, clock).ok,
    ).toBe(true);
    expect(realm.quests?.["char-rowan"]?.[MEADOW_FORK_QUEST_ID]).toBeUndefined();
  });

  it("starts the meadow fork once, then auto-starts the flock after the report", () => {
    const realm = world();
    const clock = runtime();
    realm.characters["char-rowan"] = {
      id: "char-rowan",
      name: "Rowan",
      roomId: "wren-croft",
      discoveredRoomIds: ["wren-croft"],
      schoolId: "steel",
    };
    realm.quests = {
      "char-rowan": {
        [STILL_SLEEPS_QUEST_ID]: {
          questId: STILL_SLEEPS_QUEST_ID,
          status: "completed",
          completedObjectiveIds: ["defeat-queen"],
          rewardGranted: true,
        },
        "third-lessons-steel": {
          questId: "third-lessons-steel",
          status: "completed",
          completedObjectiveIds: ["talk-alder", "report"],
          rewardGranted: true,
        },
      },
    };
    expect(
      handleTalk(realm, { verb: "talk", characterId: "char-rowan", target: "wren" }, clock).ok,
    ).toBe(true);
    expect(realm.quests?.["char-rowan"]?.[MEADOW_FORK_QUEST_ID]?.status).toBe("active");
    expect(realm.quests?.["char-rowan"]?.[UNCOUNTED_FLOCK_QUEST_ID]).toBeUndefined();

    realm.characters["char-rowan"]!.roomId = "moor-track";
    progressQuests(realm, { characterId: "char-rowan", kind: "move", roomId: "moor-track" }, clock);
    progressQuests(
      realm,
      { characterId: "char-rowan", kind: "examine", targetId: "object-waystone" },
      clock,
    );
    realm.characters["char-rowan"]!.roomId = "wren-croft";
    expect(
      handleTalk(realm, { verb: "talk", characterId: "char-rowan", target: "wren" }, clock).ok,
    ).toBe(true);
    expect(realm.quests?.["char-rowan"]?.[MEADOW_FORK_QUEST_ID]?.status).toBe("completed");
    expect(realm.quests?.["char-rowan"]?.[UNCOUNTED_FLOCK_QUEST_ID]?.status).toBe("active");
  });

  it("does not complete third-lessons talk alder until Sleeps is done", () => {
    const realm = world();
    const clock = runtime();
    realm.characters["char-rowan"] = {
      id: "char-rowan",
      name: "Rowan",
      roomId: "headmaster-study",
      discoveredRoomIds: ["headmaster-study"],
      schoolId: "steel",
    };
    startQuest(realm, "char-rowan", "third-lessons-steel", clock);
    expect(
      handleTalk(realm, { verb: "talk", characterId: "char-rowan", target: "alder" }, clock).ok,
    ).toBe(true);
    expect(realm.quests?.["char-rowan"]?.["third-lessons-steel"]?.completedObjectiveIds).toEqual(
      [],
    );

    realm.quests!["char-rowan"]![STILL_SLEEPS_QUEST_ID] = {
      questId: STILL_SLEEPS_QUEST_ID,
      status: "completed",
      completedObjectiveIds: ["defeat-queen"],
      rewardGranted: true,
    };
    expect(
      handleTalk(realm, { verb: "talk", characterId: "char-rowan", target: "alder" }, clock).ok,
    ).toBe(true);
    expect(realm.quests?.["char-rowan"]?.["third-lessons-steel"]?.completedObjectiveIds).toEqual([
      "talk-alder",
    ]);
  });

  it("keeps Wren on the barrow lip until Colm is examined, and Fen until Wren is told", () => {
    const realm = world();
    const clock = runtime();
    realm.characters["char-rowan"] = {
      id: "char-rowan",
      name: "Rowan",
      roomId: "wren-croft",
      discoveredRoomIds: ["wren-croft", "infirmary"],
      schoolId: "steel",
    };
    realm.quests = {
      "char-rowan": {
        [STILL_SLEEPS_QUEST_ID]: {
          questId: STILL_SLEEPS_QUEST_ID,
          status: "completed",
          completedObjectiveIds: ["defeat-queen"],
          rewardGranted: true,
        },
        "third-lessons-steel": {
          questId: "third-lessons-steel",
          status: "completed",
          completedObjectiveIds: ["talk-alder", "report"],
          rewardGranted: true,
        },
        [MEADOW_FORK_QUEST_ID]: {
          questId: MEADOW_FORK_QUEST_ID,
          status: "completed",
          completedObjectiveIds: ["walk-track", "hear-wren", "read-waystone", "report"],
          rewardGranted: true,
        },
        [BARROW_MOUTH_QUEST_ID]: {
          questId: BARROW_MOUTH_QUEST_ID,
          status: "completed",
          completedObjectiveIds: ["reach-mouth", "read-cloak", "defeat-guard", "report"],
          rewardGranted: true,
        },
        [FOG_TOOK_QUEST_ID]: {
          questId: FOG_TOOK_QUEST_ID,
          status: "active",
          completedObjectiveIds: [],
          rewardGranted: false,
        },
      },
    };
    expect(
      handleTalk(realm, { verb: "talk", characterId: "char-rowan", target: "wren" }, clock).ok,
    ).toBe(true);
    expect(realm.characters["char-rowan"]?.openConversation?.nodeId).toBe("barrow-done");

    realm.characters["char-rowan"]!.roomId = "infirmary";
    expect(
      handleTalk(realm, { verb: "talk", characterId: "char-rowan", target: "fen" }, clock).ok,
    ).toBe(true);
    expect(realm.characters["char-rowan"]?.openConversation?.nodeId).toBe("welcome");

    realm.quests!["char-rowan"]![FOG_TOOK_QUEST_ID] = {
      questId: FOG_TOOK_QUEST_ID,
      status: "active",
      completedObjectiveIds: ["read-colm", "tell-wren"],
      rewardGranted: false,
    };
    realm.characters["char-rowan"]!.roomId = "wren-croft";
    expect(
      handleTalk(realm, { verb: "talk", characterId: "char-rowan", target: "wren" }, clock).ok,
    ).toBe(true);
    expect(realm.characters["char-rowan"]?.openConversation?.nodeId).toBe("after-colm");
    realm.characters["char-rowan"]!.roomId = "infirmary";
    expect(
      handleTalk(realm, { verb: "talk", characterId: "char-rowan", target: "fen" }, clock).ok,
    ).toBe(true);
    expect(realm.characters["char-rowan"]?.openConversation?.nodeId).toBe("after-colm");
  });

  it("lets Alder keep Wren's kettle while the moor chain is still open", () => {
    const realm = world();
    const clock = runtime();
    realm.characters["char-rowan"] = {
      id: "char-rowan",
      name: "Rowan",
      roomId: "headmaster-study",
      discoveredRoomIds: ["headmaster-study"],
      schoolId: "steel",
    };
    realm.quests = {
      "char-rowan": {
        "the-bell-below": {
          questId: "the-bell-below",
          status: "completed",
          completedObjectiveIds: ["report"],
          rewardGranted: true,
        },
        "the-bell-wakes": {
          questId: "the-bell-wakes",
          status: "completed",
          completedObjectiveIds: ["report"],
          rewardGranted: true,
        },
        [STILL_SLEEPS_QUEST_ID]: {
          questId: STILL_SLEEPS_QUEST_ID,
          status: "completed",
          completedObjectiveIds: ["defeat-queen"],
          rewardGranted: true,
        },
        "third-lessons-steel": {
          questId: "third-lessons-steel",
          status: "completed",
          completedObjectiveIds: ["talk-alder", "report"],
          rewardGranted: true,
        },
        [MEADOW_FORK_QUEST_ID]: {
          questId: MEADOW_FORK_QUEST_ID,
          status: "completed",
          completedObjectiveIds: ["walk-track", "hear-wren", "read-waystone", "report"],
          rewardGranted: true,
        },
      },
    };
    expect(
      handleTalk(realm, { verb: "talk", characterId: "char-rowan", target: "alder" }, clock).ok,
    ).toBe(true);
    expect(realm.characters["char-rowan"]?.openConversation?.nodeId).toBe("watch-active");
  });

  it("lets Quill keep an abbey-mark rubbing after the stones", () => {
    const realm = world();
    const clock = runtime();
    realm.rooms["library-stacks"] = {
      id: "library-stacks",
      title: "Library Stacks",
      shortDescription: "Shelves.",
      longDescription: "Paper.",
      zone: "studies",
      exits: [],
      fixtures: [
        {
          id: QUILL_NPC_ID,
          name: "Librarian Quill",
          kind: "npc",
          dialogue: "Paper first.",
          dialogueTree: {
            start: "welcome",
            nodes: {
              welcome: { text: "Blame is a poor bookmark." },
              "abbey-rubbing": { text: "Bring a rubbing." },
              "abbey-rubbing-kept": { text: "You brought the rubbing." },
            },
          },
        },
      ],
    };
    realm.characters["char-rowan"] = {
      id: "char-rowan",
      name: "Rowan",
      roomId: "library-stacks",
      discoveredRoomIds: ["library-stacks"],
    };
    realm.quests = {
      "char-rowan": {
        [STONES_QUEST_ID]: {
          questId: STONES_QUEST_ID,
          status: "completed",
          completedObjectiveIds: ["reach-stones", "read-mark", "read-new", "report"],
          rewardGranted: true,
        },
      },
    };
    expect(
      handleTalk(realm, { verb: "talk", characterId: "char-rowan", target: "quill" }, clock).ok,
    ).toBe(true);
    expect(realm.characters["char-rowan"]?.openConversation?.nodeId).toBe("abbey-rubbing");
    realm.items = {
      "item-abbey-mark-rubbing-char-rowan": {
        id: "item-abbey-mark-rubbing-char-rowan",
        templateId: "abbey-mark-rubbing",
        name: "Abbey Mark Rubbing",
        examineDescription: "Three circles.",
        holderCharacterId: "char-rowan",
      },
    };
    expect(
      handleTalk(realm, { verb: "talk", characterId: "char-rowan", target: "quill" }, clock).ok,
    ).toBe(true);
    expect(realm.characters["char-rowan"]?.openConversation?.nodeId).toBe("abbey-rubbing-kept");
  });
});
