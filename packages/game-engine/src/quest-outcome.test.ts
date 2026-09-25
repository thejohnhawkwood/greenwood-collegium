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

  it("takes an equip as the branch a story asked for", () => {
    const realm = world();
    const clock = runtime();
    realm.questTemplates = {
      "the-pressed-mask": {
        id: "the-pressed-mask",
        title: "The Pressed Mask",
        giverNpcId: GIVER,
        introNarration: "Bring it into lamplight.",
        reminderNarration: "Take the mask.",
        experienceReward: 25,
        outcomes: [
          { id: "worn", completionNarration: "You put it on in front of her." },
          {
            id: "returned",
            completionNarration: "You carry it up unworn.",
            itemRewardTemplateId: "focus-ring",
          },
        ],
        objectives: [
          {
            id: "put-it-on",
            kind: "equip",
            itemTemplateId: "pressed-mask",
            outcome: "worn",
            label: "Type equip mask.",
          },
          {
            id: "carry-it-up",
            kind: "talk",
            targetId: GIVER,
            outcome: "returned",
            label: "Type talk pell.",
          },
        ],
      },
    };
    realm.items = {
      "mask-1": {
        id: "mask-1",
        templateId: "pressed-mask",
        name: "Pressed Mask",
        examineDescription: "Silk.",
        holderCharacterId: "char-rowan",
        equipSlot: "helmet",
      },
    };
    realm.itemTemplates = {
      ...realm.itemTemplates,
      "pressed-mask": {
        id: "pressed-mask",
        name: "Pressed Mask",
        examineDescription: "Silk.",
        category: "ordinary",
        equipSlot: "helmet",
      },
    };
    startQuest(realm, "char-rowan", "the-pressed-mask", clock);

    // Holding it is not wearing it.
    expect(progressQuests(realm, { characterId: "char-rowan", kind: "equip" }, clock)).toEqual([]);

    realm.characters["char-rowan"]!.equipment = { helmet: "mask-1" };
    const events = progressQuests(realm, { characterId: "char-rowan", kind: "equip" }, clock);
    expect(realm.quests?.["char-rowan"]?.["the-pressed-mask"]?.outcome).toBe("worn");
    expect(events.some((event) => event.narration.includes("put it on in front of her"))).toBe(
      true,
    );
    expect(Object.values(realm.items ?? {}).some((item) => item.templateId === "focus-ring")).toBe(
      false,
    );
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
