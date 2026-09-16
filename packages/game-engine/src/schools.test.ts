import { describe, expect, it } from "vitest";
import { progressQuests } from "./arrival.js";
import { handleCast } from "./cast.js";
import { handleMove } from "./move.js";
import { handleSay } from "./say.js";
import { handleTalk } from "./talk.js";
import { handleJoin } from "./presence.js";
import type { EngineRuntime, SpellTemplate, WorldState } from "./state.js";

function runtime(): EngineRuntime {
  let sequence = 0;
  let events = 0;
  return {
    now: () => new Date("2026-09-16T19:00:00.000Z"),
    nextEventId: () => `evt-school-${String((events += 1))}`,
    nextSequence: () => (sequence += 1),
  };
}

function world(): WorldState {
  return {
    rooms: {
      "headmaster-study": {
        id: "headmaster-study",
        title: "The High Study",
        shortDescription: "A study.",
        longDescription: "Oak.",
        zone: "academy-core",
        exits: [{ direction: "down", toRoomId: "hearth-steel" }],
        fixtures: [
          {
            id: "npc-headmaster-alder",
            name: "Headmaster Alder",
            kind: "npc",
            dialogue: "Choose.",
            dialogueTree: {
              start: "welcome",
              nodes: {
                welcome: {
                  text: "Pick Steel.",
                  choices: [
                    { say: "6", label: "School of Steel", next: "chosen-steel", school: "steel" },
                  ],
                },
              },
            },
          },
        ],
      },
      "hearth-steel": {
        id: "hearth-steel",
        title: "Hearth of Steel",
        shortDescription: "Anvils.",
        longDescription: "Mail.",
        zone: "schools",
        exits: [
          { direction: "up", toRoomId: "headmaster-study" },
          { direction: "south", toRoomId: "south-orchard" },
        ],
        fixtures: [
          {
            id: "npc-mentor-edge",
            name: "Mentor Edge",
            kind: "npc",
            dialogue: "Train.",
            dialogueTree: {
              start: "welcome",
              nodes: {
                welcome: { text: "Find Flint, then return." },
                "lessons-done": { text: "Steel has your name. Your kit is open." },
              },
            },
          },
          {
            id: "object-steel-anvil",
            name: "Practice Anvil",
            kind: "object",
            examineDescription: "Oiled iron.",
          },
        ],
      },
      "south-orchard": {
        id: "south-orchard",
        title: "South Orchard",
        shortDescription: "Apples.",
        longDescription: "A dummy waits.",
        zone: "grounds",
        exits: [{ direction: "north", toRoomId: "hearth-steel" }],
        fixtures: [],
      },
    },
    characters: {},
    items: {},
    enemies: {
      "enemy-practice-dummy-south-orchard": {
        id: "enemy-practice-dummy-south-orchard",
        templateId: "practice-dummy",
        name: "Practice Dummy",
        examineDescription: "Straw.",
        roomId: "south-orchard",
        maxHealth: 8,
        attack: 1,
        experience: 1,
      },
    },
    spells: {
      strike: {
        id: "strike",
        name: "Strike",
        school: "steel",
        description: "A clean cut.",
        focusCost: 3,
        targetType: "enemy",
        context: "encounter",
        damage: 6,
        minLevel: 3,
        presentationKey: "steel-strike",
        helpText: "cast strike",
      } satisfies SpellTemplate,
    },
    questTemplates: {
      "first-lessons-steel": {
        id: "first-lessons-steel",
        title: "First Lessons: Steel",
        introNarration: "Edge sets your first work.",
        reminderNarration: "Look, visit the orchard, talk Edge.",
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
      "the-bell-below": {
        id: "the-bell-below",
        title: "The Bell Below",
        introNarration: "Alder names the bell below.",
        reminderNarration: "Examine the three clues, then talk alder.",
        experienceReward: 10,
        objectives: [
          {
            id: "talk-alder",
            kind: "talk",
            label: "Talk alder.",
            targetId: "npc-headmaster-alder",
          },
        ],
      },
    },
  };
}

describe("school hearth after a choice", () => {
  it("lands a Steel pick in the hearth and tracks first lessons to the dummy and back", () => {
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
          experience: 10,
          level: 2,
        },
        clock,
      ).ok,
    ).toBe(true);
    handleTalk(realm, { verb: "talk", characterId: "char-rowan", target: "alder" }, clock);
    handleSay(realm, { verb: "say", characterId: "char-rowan", text: "6" }, clock);
    const student = realm.characters["char-rowan"];
    expect(student?.schoolId).toBe("steel");
    expect(student?.roomId).toBe("hearth-steel");
    expect(realm.quests?.["char-rowan"]?.["first-lessons-steel"]?.completedObjectiveIds).toEqual([
      "look-hearth",
    ]);
    handleMove(realm, { verb: "move", characterId: "char-rowan", direction: "south" }, clock);
    progressQuests(realm, { characterId: "char-rowan", kind: "move" }, clock);
    expect(realm.characters["char-rowan"]?.roomId).toBe("south-orchard");
    expect(realm.quests?.["char-rowan"]?.["first-lessons-steel"]?.completedObjectiveIds).toEqual([
      "look-hearth",
      "visit-orchard",
    ]);
    handleMove(realm, { verb: "move", characterId: "char-rowan", direction: "north" }, clock);
    const reported = handleTalk(
      realm,
      { verb: "talk", characterId: "char-rowan", target: "edge" },
      clock,
    );
    expect(reported.ok).toBe(true);
    expect(realm.quests?.["char-rowan"]?.["first-lessons-steel"]?.status).toBe("completed");
    expect(realm.quests?.["char-rowan"]?.["the-bell-below"]?.status).toBe("active");
    expect(realm.characters["char-rowan"]?.openConversation).toEqual({
      npcId: "npc-mentor-edge",
      nodeId: "lessons-done",
    });
    expect(realm.characters["char-rowan"]?.experience).toBe(20);
    expect(realm.characters["char-rowan"]?.level).toBe(3);
    expect(
      reported.ok && reported.events.some((event) => event.narration.includes("cast strike")),
    ).toBe(true);
    expect(
      reported.ok && reported.events.some((event) => event.narration.includes("High Study")),
    ).toBe(true);
    expect(
      reported.ok && reported.events.some((event) => event.narration.includes("bell below")),
    ).toBe(true);
    handleMove(realm, { verb: "move", characterId: "char-rowan", direction: "south" }, clock);
    expect(
      handleCast(
        realm,
        { verb: "cast", characterId: "char-rowan", spell: "strike", target: "dummy" },
        clock,
      ).ok,
    ).toBe(true);
  });

  it("keeps a School gift locked until the third year-mark", () => {
    const realm = world();
    const clock = runtime();
    expect(
      handleJoin(
        realm,
        {
          verb: "join",
          characterId: "char-rowan",
          name: "Rowan",
          roomId: "south-orchard",
          schoolId: "steel",
          level: 2,
        },
        clock,
      ).ok,
    ).toBe(true);
    expect(
      handleCast(
        realm,
        { verb: "cast", characterId: "char-rowan", spell: "strike", target: "dummy" },
        clock,
      ),
    ).toMatchObject({ ok: false, code: "gift_locked" });
  });
});
