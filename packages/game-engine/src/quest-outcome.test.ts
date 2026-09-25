import { describe, expect, it } from "vitest";
import { applyQuestProgress, listQuestRecords, progressQuests, startQuest } from "./arrival.js";
import type { EngineRuntime, QuestTemplate, WorldState } from "./state.js";

const GIVER = "npc-scribe-pell";

/** H1. One shared errand, then a fork the engine has to remember. */
const forked: QuestTemplate = {
  id: "the-borrowed-ink",
  title: "The Borrowed Ink",
  giverNpcId: GIVER,
  introNarration: "The ink is in the Scriptorium.",
  reminderNarration: "Fetch the ink, then decide.",
  experienceReward: 20,
  outcomes: [
    {
      id: "returned",
      completionNarration: "You hand the bottle back.",
      itemRewardTemplateId: "focus-ring",
    },
    { id: "kept", completionNarration: "You use the ink yourself." },
  ],
  objectives: [
    { id: "fetch", kind: "take", itemTemplateId: "borrowed-ink", label: "Take the ink." },
    {
      id: "give-back",
      kind: "talk",
      targetId: GIVER,
      requires: ["fetch"],
      outcome: "returned",
      label: "Return the ink. Type talk pell.",
    },
    {
      id: "use-it",
      kind: "cast",
      targetId: "ember",
      requires: ["fetch"],
      outcome: "kept",
      label: "Raise the spell. Type cast ember.",
    },
  ],
};

function runtime(): EngineRuntime {
  let sequence = 0;
  let events = 0;
  return {
    now: () => new Date("2026-09-24T18:00:00.000Z"),
    nextEventId: () => `evt-outcome-${String((events += 1))}`,
    nextSequence: () => (sequence += 1),
  };
}

function world(): WorldState {
  return {
    rooms: {
      scriptorium: {
        id: "scriptorium",
        title: "Scriptorium",
        shortDescription: "Desks.",
        longDescription: "Ink and paper.",
        zone: "studies",
        exits: [],
        fixtures: [{ id: GIVER, name: "Scribe Pell", kind: "npc", dialogue: "The ink." }],
      },
    },
    characters: {
      "char-rowan": {
        id: "char-rowan",
        name: "Rowan",
        roomId: "scriptorium",
        discoveredRoomIds: ["scriptorium"],
      },
    },
    items: {
      "item-borrowed-ink-char-rowan": {
        id: "item-borrowed-ink-char-rowan",
        templateId: "borrowed-ink",
        name: "Borrowed Ink",
        examineDescription: "A stoppered bottle.",
        holderCharacterId: "char-rowan",
        availableToCharacterId: "char-rowan",
      },
    },
    itemTemplates: {
      "focus-ring": {
        id: "focus-ring",
        name: "Focus Ring",
        shortDescription: "A ring.",
        examineDescription: "Plain silver.",
        category: "ordinary",
        equipSlot: "ring",
      },
    },
    questTemplates: { [forked.id]: forked },
  };
}

function fetchThen(trigger: "talk" | "cast") {
  const realm = world();
  const clock = runtime();
  startQuest(realm, "char-rowan", forked.id, clock);
  progressQuests(realm, { characterId: "char-rowan", kind: "take" }, clock);
  const events = progressQuests(
    realm,
    trigger === "talk"
      ? { characterId: "char-rowan", kind: "talk", targetId: GIVER }
      : { characterId: "char-rowan", kind: "cast", targetId: "ember" },
    clock,
  );
  return { realm, clock, events };
}

describe("remembered choice", () => {
  it("completes on the returned branch and pays that branch's item", () => {
    const { realm, events } = fetchThen("talk");
    const progress = realm.quests?.["char-rowan"]?.[forked.id];
    expect(progress?.status).toBe("completed");
    expect(progress?.outcome).toBe("returned");
    expect(events.some((event) => event.narration.includes("hand the bottle back"))).toBe(true);
    expect(events.some((event) => event.narration.includes("use the ink yourself"))).toBe(false);
    expect(Object.values(realm.items ?? {}).some((item) => item.templateId === "focus-ring")).toBe(
      true,
    );
    expect(realm.characters["char-rowan"]?.experience).toBe(20);
  });

  it("completes on the kept branch with no item, and the same experience", () => {
    const { realm, events } = fetchThen("cast");
    const progress = realm.quests?.["char-rowan"]?.[forked.id];
    expect(progress?.status).toBe("completed");
    expect(progress?.outcome).toBe("kept");
    expect(events.some((event) => event.narration.includes("use the ink yourself"))).toBe(true);
    expect(Object.values(realm.items ?? {}).some((item) => item.templateId === "focus-ring")).toBe(
      false,
    );
    expect(realm.characters["char-rowan"]?.experience).toBe(20);
  });

  it("does not leave the branch not walked as unfinished work", () => {
    const { realm, clock } = fetchThen("talk");
    const later = progressQuests(
      realm,
      { characterId: "char-rowan", kind: "cast", targetId: "ember" },
      clock,
    );
    expect(later).toEqual([]);
    expect(realm.characters["char-rowan"]?.experience).toBe(20);
    expect(realm.quests?.["char-rowan"]?.[forked.id]?.outcome).toBe("returned");
  });

  it("carries the outcome through a restart", () => {
    const { realm } = fetchThen("cast");
    const records = listQuestRecords(realm, "char-rowan");
    expect(records[0]?.outcome).toBe("kept");
    const restored = world();
    applyQuestProgress(restored, "char-rowan", records);
    expect(restored.quests?.["char-rowan"]?.[forked.id]?.outcome).toBe("kept");
  });
});
