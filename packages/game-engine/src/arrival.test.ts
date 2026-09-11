import {
  experienceGainedEventSchema,
  levelGainedEventSchema,
  questUpdatedEventSchema,
} from "@greenwood/contracts";
import { describe, expect, it } from "vitest";
import {
  applyQuestProgress,
  ARRIVAL_QUEST_ID,
  progressQuests,
  startArrivalQuest,
} from "./arrival.js";
import { handleJoin } from "./presence.js";
import { handleLook } from "./look.js";
import { handleMove } from "./move.js";
import { handleSay } from "./say.js";
import { handleTake } from "./take.js";
import type { EngineRuntime, QuestTemplate, WorldState } from "./state.js";

const arrivalTemplate: QuestTemplate = {
  id: ARRIVAL_QUEST_ID,
  title: "Arrival at the Collegium",
  introNarration:
    "Porter Bramble bustles from the lanterns. Type look, say hello, take key, then north. Type help if a word slips.",
  reminderNarration: "Porter Bramble nods. Type help or quests.",
  experienceReward: 10,
  objectives: [
    { id: "look", kind: "look", label: "Look around Lantern Court. Type look to see Lantern Court." },
    { id: "speak", kind: "say", label: "Say hello so Porter knows you arrived." },
    {
      id: "take",
      kind: "take",
      label: "Take the Small Copper Key from Porter. Type take Small Copper Key.",
      itemTemplateId: "small-copper-key",
    },
    {
      id: "arrive",
      kind: "visit",
      label: "Type north to reach the Great Hall.",
      roomId: "great-hall",
    },
  ],
};

function courtWorld(): WorldState {
  return {
    rooms: {
      "lantern-court": {
        id: "lantern-court",
        title: "Lantern Court",
        shortDescription: "A courtyard.",
        longDescription: "Blue lanterns drift.",
        zone: "academy-core",
        exits: [{ direction: "north", toRoomId: "great-hall" }],
        fixtures: [{ id: "npc-porter-bramble", name: "Porter Bramble", kind: "npc" }],
      },
      "great-hall": {
        id: "great-hall",
        title: "Great Hall",
        shortDescription: "A hall.",
        longDescription: "Oak tables wait.",
        zone: "academy-core",
        exits: [{ direction: "south", toRoomId: "lantern-court" }],
        fixtures: [],
      },
    },
    characters: {},
    items: {},
    starterPlacements: [
      {
        id: "item-copper-key-lantern-court",
        templateId: "small-copper-key",
        name: "Small Copper Key",
        examineDescription: "The bow is worn smooth.",
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
    now: () => new Date("2026-09-07T21:00:00.000Z"),
    nextEventId: () => `evt-arrival-${String((events += 1))}`,
    nextSequence: () => (sequence += 1),
  };
}

describe("Arrival at the Collegium", () => {
  it("greets a new student without counting the join look", () => {
    const world = courtWorld();
    const clock = runtime();
    const joined = handleJoin(
      world,
      { verb: "join", characterId: "char-rowan", name: "Rowan the Hare", roomId: "lantern-court" },
      clock,
    );
    expect(joined.ok).toBe(true);
    if (!joined.ok) {
      return;
    }
    expect(joined.events.map((event) => event.type)).toEqual([
      "room.snapshot",
      "system.notice",
      "quest.updated",
    ]);
    expect(joined.events[1]?.narration).toContain("Porter Bramble");
    expect(joined.events[1]?.narration).toContain("help");
    const started = questUpdatedEventSchema.parse(joined.events[2]);
    expect(started.payload.completedObjectives).toEqual([]);
    expect(world.quests?.["char-rowan"]?.[ARRIVAL_QUEST_ID]?.completedObjectiveIds).toEqual([]);
  });

  it("reminds on a later join and skips the speech after completion", () => {
    const world = courtWorld();
    const clock = runtime();
    applyQuestProgress(world, "char-rowan", [
      {
        characterId: "char-rowan",
        questId: ARRIVAL_QUEST_ID,
        status: "active",
        completedObjectiveIds: ["look"],
        rewardGranted: false,
      },
    ]);
    const reminder = startArrivalQuest(world, "char-rowan", clock);
    expect(reminder).toHaveLength(1);
    expect(reminder[0]?.narration).toContain("Type help or quests");

    applyQuestProgress(world, "char-moss", [
      {
        characterId: "char-moss",
        questId: ARRIVAL_QUEST_ID,
        status: "completed",
        completedObjectiveIds: ["look", "speak", "take", "arrive"],
        rewardGranted: true,
      },
    ]);
    expect(startArrivalQuest(world, "char-moss", clock)).toEqual([]);
  });

  it("completes look, say, take, and north once, then refuses a second reward", () => {
    const world = courtWorld();
    const clock = runtime();
    const joined = handleJoin(
      world,
      { verb: "join", characterId: "char-rowan", name: "Rowan the Hare", roomId: "lantern-court" },
      clock,
    );
    expect(joined.ok).toBe(true);

    const looked = handleLook(world, { verb: "look", characterId: "char-rowan" }, clock);
    expect(looked.ok).toBe(true);
    const afterLook = progressQuests(world, { characterId: "char-rowan", kind: "look" }, clock);
    expect(questUpdatedEventSchema.parse(afterLook[0]).payload.completedObjectives).toEqual([
      "Look around Lantern Court. Type look to see Lantern Court.",
    ]);

    const said = handleSay(world, { verb: "say", characterId: "char-rowan", text: "hello" }, clock);
    expect(said.ok).toBe(true);
    expect(
      progressQuests(world, { characterId: "char-rowan", kind: "say" }, clock)[0]?.narration,
    ).toContain("2/4");

    const taken = handleTake(
      world,
      { verb: "take", characterId: "char-rowan", target: "Small Copper Key" },
      clock,
    );
    expect(taken.ok).toBe(true);
    expect(
      progressQuests(world, { characterId: "char-rowan", kind: "take" }, clock)[0]?.narration,
    ).toContain("3/4");

    const moved = handleMove(
      world,
      { verb: "move", characterId: "char-rowan", direction: "north" },
      clock,
    );
    expect(moved.ok).toBe(true);
    const finished = progressQuests(world, { characterId: "char-rowan", kind: "move" }, clock);
    expect(finished.map((event) => event.type)).toEqual([
      "quest.updated",
      "progress.experience_gained",
      "progress.level_gained",
    ]);
    expect(questUpdatedEventSchema.parse(finished[0]).payload.status).toBe("completed");
    expect(experienceGainedEventSchema.parse(finished[1]).payload).toMatchObject({
      amount: 10,
      total: 10,
    });
    expect(levelGainedEventSchema.parse(finished[2]).payload.level).toBe(2);
    expect(world.characters["char-rowan"]?.experience).toBe(10);
    expect(world.characters["char-rowan"]?.level).toBe(2);

    expect(progressQuests(world, { characterId: "char-rowan", kind: "look" }, clock)).toEqual([]);
    expect(progressQuests(world, { characterId: "char-rowan", kind: "say" }, clock)).toEqual([]);
    expect(progressQuests(world, { characterId: "char-rowan", kind: "move" }, clock)).toEqual([]);
    expect(world.characters["char-rowan"]?.experience).toBe(10);
  });

  it("lets two Collegians each take a key and finish the take objective", () => {
    const world = courtWorld();
    const clock = runtime();
    expect(
      handleJoin(
        world,
        {
          verb: "join",
          characterId: "char-rowan",
          name: "Rowan the Hare",
          roomId: "lantern-court",
        },
        clock,
      ).ok,
    ).toBe(true);
    expect(
      handleJoin(
        world,
        { verb: "join", characterId: "char-moss", name: "Moss the Mole", roomId: "lantern-court" },
        clock,
      ).ok,
    ).toBe(true);

    expect(
      handleTake(world, { verb: "take", characterId: "char-rowan", target: "Small Copper Key" }, clock).ok,
    ).toBe(true);
    expect(
      handleTake(world, { verb: "take", characterId: "char-moss", target: "Small Copper Key" }, clock).ok,
    ).toBe(true);
    const rowanTake = questUpdatedEventSchema.parse(
      progressQuests(world, { characterId: "char-rowan", kind: "take" }, clock)[0],
    );
    const mossTake = questUpdatedEventSchema.parse(
      progressQuests(world, { characterId: "char-moss", kind: "take" }, clock)[0],
    );
    expect(rowanTake.payload.completedObjectives).toContain(
      "Take the Small Copper Key from Porter. Type take Small Copper Key.",
    );
    expect(mossTake.payload.completedObjectives).toContain(
      "Take the Small Copper Key from Porter. Type take Small Copper Key.",
    );
  });
});
