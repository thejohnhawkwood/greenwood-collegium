import { describe, expect, it } from "vitest";
import { handleAttack } from "./attack.js";
import { handleCast } from "./cast.js";
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
        exits: [{ direction: "up", toRoomId: "headmaster-study" }],
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
    },
    characters: {},
    items: {},
    enemies: {
      "enemy-practice-dummy-hearth-steel": {
        id: "enemy-practice-dummy-hearth-steel",
        templateId: "practice-dummy",
        name: "Practice Dummy",
        examineDescription: "Straw.",
        roomId: "hearth-steel",
        maxHealth: 8,
        attack: 1,
        experience: 0,
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
        reminderNarration: "Look, defeat the dummy, talk Edge.",
        completionNarration: "Steel has your name.",
        experienceReward: 15,
        objectives: [
          { id: "look-hearth", kind: "look", label: "Look the hearth.", roomId: "hearth-steel" },
          {
            id: "defeat-dummy",
            kind: "defeat",
            label: "Defeat the hearth dummy.",
            targetId: "enemy-practice-dummy-hearth-steel",
            roomId: "hearth-steel",
            requires: ["look-hearth"],
          },
          {
            id: "report",
            kind: "talk",
            label: "Talk Edge.",
            targetId: "npc-mentor-edge",
            requires: ["defeat-dummy"],
          },
        ],
      },
      "second-lessons-steel": {
        id: "second-lessons-steel",
        title: "Second Lessons: Steel",
        introNarration: "Cast strike.",
        reminderNarration: "Cast strike, talk Edge.",
        experienceReward: 20,
        objectives: [
          {
            id: "cast-starter",
            kind: "cast",
            label: "Cast strike.",
            targetId: "strike",
            roomId: "hearth-steel",
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
  it("lands a Steel pick in the hearth and inks three leaves after the hearth dummy", () => {
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
    handleAttack(realm, { verb: "attack", characterId: "char-rowan", target: "dummy" }, clock);
    handleAttack(realm, { verb: "attack", characterId: "char-rowan" }, clock);
    const win = handleAttack(realm, { verb: "attack", characterId: "char-rowan" }, clock);
    expect(win.ok && win.outcome).toBe("victory");
    expect(realm.quests?.["char-rowan"]?.["first-lessons-steel"]?.completedObjectiveIds).toEqual([
      "look-hearth",
      "defeat-dummy",
    ]);
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
    expect(realm.characters["char-rowan"]?.experience).toBe(25);
    expect(realm.characters["char-rowan"]?.level).toBe(3);
    expect(realm.characters["char-rowan"]?.knownSpells).toEqual([
      { spellId: "strike", rank: 1, pennedBy: "Mentor Edge" },
      { spellId: "riposte", rank: 1, pennedBy: "Mentor Edge" },
      { spellId: "ready-steel", rank: 1, pennedBy: "Mentor Edge" },
    ]);
    expect(realm.quests?.["char-rowan"]?.["second-lessons-steel"]?.status).toBe("active");
    expect(
      reported.ok && reported.events.some((event) => event.narration.includes("cast strike")),
    ).toBe(true);
    expect(
      reported.ok && reported.events.some((event) => event.narration.includes("High Study")),
    ).toBe(true);
    expect(
      reported.ok && reported.events.some((event) => event.narration.includes("bell below")),
    ).toBe(true);
    expect(
      handleCast(
        realm,
        { verb: "cast", characterId: "char-rowan", spell: "strike", target: "dummy" },
        clock,
      ).ok,
    ).toBe(true);
  });

  it("keeps a School gift locked until the Primer inks it", () => {
    const realm = world();
    const clock = runtime();
    expect(
      handleJoin(
        realm,
        {
          verb: "join",
          characterId: "char-rowan",
          name: "Rowan",
          roomId: "hearth-steel",
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
