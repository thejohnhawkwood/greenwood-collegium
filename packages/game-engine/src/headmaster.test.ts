import { describe, expect, it } from "vitest";
import { ARRIVAL_QUEST_ID, progressQuests, startArrivalQuest } from "./arrival.js";
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
    questTemplates: { [ARRIVAL_QUEST_ID]: arrivalTemplate },
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
    expect(realm.characters["char-rowan"]?.openConversation?.nodeId).toBe("chosen-steel");
    expect(createPlayState(realm, "char-rowan")?.conversation?.prompt).toBe("Steel it is.");
    const again = handleTalk(
      realm,
      { verb: "talk", characterId: "char-rowan", target: "alder" },
      clock,
    );
    expect(again.ok).toBe(true);
    expect(realm.characters["char-rowan"]?.openConversation?.nodeId).toBe("already-chosen");
  });
});
