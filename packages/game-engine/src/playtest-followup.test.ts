import { describe, expect, it } from "vitest";
import { ARRIVAL_QUEST_ID, progressQuests } from "./arrival.js";
import { handleJoin } from "./presence.js";
import { handleLook } from "./look.js";
import { handleMove } from "./move.js";
import { handleSay } from "./say.js";
import { handleStats } from "./stats.js";
import { handleTake } from "./take.js";
import { handleTalk } from "./talk.js";
import { parsePlayerCommand } from "./parse-command.js";
import type { EngineRuntime, WorldState } from "./state.js";

function runtime(): EngineRuntime {
  let sequence = 0;
  let events = 0;
  return {
    now: () => new Date("2026-09-11T18:00:00.000Z"),
    nextEventId: () => `evt-followup-${String((events += 1))}`,
    nextSequence: () => (sequence += 1),
    random: () => 0.5,
  };
}

function syntheticWorld(): WorldState {
  return {
    rooms: {
      "lantern-court": {
        id: "lantern-court",
        title: "Lantern Court",
        shortDescription: "A courtyard.",
        longDescription: "Blue lanterns drift over warm stones.",
        zone: "academy-core",
        exits: [
          { direction: "north", toRoomId: "great-hall" },
          { direction: "south", toRoomId: "south-orchard" },
        ],
        fixtures: [
          {
            id: "npc-porter-bramble",
            name: "Porter Bramble",
            kind: "npc",
            lookDescription: "A hedgehog porter holding a Small Copper Key.",
            dialogue: "This is a school.",
            dialogueTree: {
              start: "school",
              nodes: {
                school: {
                  text: "The Collegium is a school where woodland students train.",
                  choices: [
                    { say: "1", label: "What should I type?", next: "commands" },
                    { say: "2", label: "I am ready." },
                  ],
                },
                commands: {
                  text: "Type take Small Copper Key, then north to reach the Great Hall.",
                },
              },
            },
          },
        ],
      },
      "great-hall": {
        id: "great-hall",
        title: "Great Hall",
        shortDescription: "A hall.",
        longDescription: "Oak tables wait under banners.",
        zone: "academy-core",
        exits: [{ direction: "south", toRoomId: "lantern-court" }],
        fixtures: [],
      },
      "south-orchard": {
        id: "south-orchard",
        title: "South Orchard",
        shortDescription: "A practice clearing.",
        longDescription: "Flint watches the dummy beside a weapon rack.",
        zone: "grounds",
        exits: [{ direction: "north", toRoomId: "lantern-court" }],
        fixtures: [
          {
            id: "npc-instructor-flint",
            name: "Instructor Flint",
            kind: "npc",
            dialogue: "Which weapon do you want to try?",
            dialogueTree: {
              start: "ask",
              nodes: {
                ask: {
                  text: "Which weapon will you try?",
                  choices: [{ say: "1", label: "Why does a weapon fit?", next: "fit" }],
                },
                fit: { text: "Hares prefer the sword." },
                misfit: {
                  text: "That weapon is a poor fit.",
                  choices: [
                    { say: "1", label: "Why?", next: "fit" },
                    { say: "yes", label: "I will switch." },
                  ],
                },
              },
            },
          },
        ],
      },
    },
    characters: {},
    items: {
      "item-practice-sword-south-orchard": {
        id: "item-practice-sword-south-orchard",
        templateId: "practice-sword",
        name: "Practice Sword",
        examineDescription: "Wood.",
        roomId: "south-orchard",
        category: "weapon",
        itemType: "sword",
        training: true,
      },
      "item-practice-staff-south-orchard": {
        id: "item-practice-staff-south-orchard",
        templateId: "practice-staff",
        name: "Practice Staff",
        examineDescription: "Ash.",
        roomId: "south-orchard",
        category: "weapon",
        itemType: "staff",
        training: true,
      },
      "item-practice-sling-south-orchard": {
        id: "item-practice-sling-south-orchard",
        templateId: "practice-sling",
        name: "Practice Sling",
        examineDescription: "Leather.",
        roomId: "south-orchard",
        category: "weapon",
        itemType: "sling",
        training: true,
      },
    },
    itemTemplates: {
      "practice-sword": {
        id: "practice-sword",
        name: "Practice Sword",
        examineDescription: "Wood.",
        category: "weapon",
        itemType: "sword",
        training: true,
      },
      "practice-staff": {
        id: "practice-staff",
        name: "Practice Staff",
        examineDescription: "Ash.",
        category: "weapon",
        itemType: "staff",
        training: true,
      },
    },
    starterPlacements: [
      {
        id: "item-copper-key-lantern-court",
        templateId: "small-copper-key",
        name: "Small Copper Key",
        examineDescription: "Worn smooth.",
        roomId: "lantern-court",
        category: "key",
        itemType: "key",
      },
    ],
    speciesProficiencies: { hare: "sword", mole: "staff" },
    questTemplates: {
      [ARRIVAL_QUEST_ID]: {
        id: ARRIVAL_QUEST_ID,
        title: "Arrival at the Collegium",
        introNarration:
          "This is a school. Type look, say hello, take Small Copper Key, then north to reach the Great Hall. Type help if a word slips.",
        reminderNarration: "Type take Small Copper Key, then north to reach the Great Hall.",
        experienceReward: 10,
        objectives: [
          { id: "look", kind: "look", label: "Look around Lantern Court. Type look to see Lantern Court." },
          { id: "speak", kind: "say", label: "Say hello so Porter knows you arrived." },
          {
            id: "take",
            kind: "take",
            label: "Type take Small Copper Key.",
            itemTemplateId: "small-copper-key",
          },
          { id: "arrive", kind: "visit", label: "Type north to reach the Great Hall.", roomId: "great-hall" },
        ],
      },
    },
  };
}

describe("playtest follow-up synthetic Collegian", () => {
  it("walks Arrival, where/stats, and training weapons as Rowan the Hare", () => {
    const world = syntheticWorld();
    const clock = runtime();
    const joined = handleJoin(
      world,
      {
        verb: "join",
        characterId: "char-rowan",
        name: "Rowan the Hare",
        roomId: "lantern-court",
        speciesId: "hare",
      },
      clock,
    );
    expect(joined.ok).toBe(true);
    if (!joined.ok) {
      return;
    }
    expect(joined.events.some((event) => event.narration.includes("school"))).toBe(true);

    const looked = handleLook(world, { verb: "look", characterId: "char-rowan" }, clock);
    expect(looked.ok && looked.event.narration).toContain("held by Porter Bramble");
    progressQuests(world, { characterId: "char-rowan", kind: "look" }, clock);

    expect(handleSay(world, { verb: "say", characterId: "char-rowan", text: "hello" }, clock).ok).toBe(
      true,
    );
    progressQuests(world, { characterId: "char-rowan", kind: "say" }, clock);

    const bare = handleTake(world, { verb: "take", characterId: "char-rowan", target: "" }, clock);
    expect(bare).toMatchObject({ ok: false, code: "item_not_found" });
    expect(bare.ok === false && bare.message).toContain("take Small Copper Key");

    const shortcut = handleTake(world, { verb: "take", characterId: "char-rowan", target: "key" }, clock);
    expect(shortcut.ok).toBe(false);
    if (!shortcut.ok) {
      expect(shortcut.message).toContain("take Small Copper Key");
    }

    const taken = handleTake(
      world,
      { verb: "take", characterId: "char-rowan", target: "Small Copper Key" },
      clock,
    );
    expect(taken.ok).toBe(true);
    progressQuests(world, { characterId: "char-rowan", kind: "take" }, clock);

    expect(parsePlayerCommand("where", "char-rowan")?.verb).toBe("look");
    const where = handleLook(world, { verb: "look", characterId: "char-rowan" }, clock);
    expect(where.ok && where.event.narration).toContain("Lantern Court");
    expect(where.ok && where.event.narration).toContain("Blue lanterns drift");

    const stats = handleStats(world, { verb: "stats", characterId: "char-rowan" }, clock);
    expect(stats.ok && stats.event.narration).toContain("Health:");
    expect(stats.ok && stats.event.narration).toContain("Location: Lantern Court");
    expect(stats.ok && stats.event.narration).toContain("Small Copper Key");

    const north = handleMove(world, { verb: "move", characterId: "char-rowan", direction: "north" }, clock);
    expect(north.ok).toBe(true);
    if (north.ok) {
      expect(north.events.some((event) => event.narration.includes("walks with you"))).toBe(true);
      expect(north.events.some((event) => event.narration.includes("Great Hall"))).toBe(true);
    }
    progressQuests(world, { characterId: "char-rowan", kind: "move" }, clock);
    expect(world.quests?.["char-rowan"]?.[ARRIVAL_QUEST_ID]?.status).toBe("completed");

    handleMove(world, { verb: "move", characterId: "char-rowan", direction: "south" }, clock);
    const orchard = handleMove(
      world,
      { verb: "move", characterId: "char-rowan", direction: "south" },
      clock,
    );
    expect(orchard.ok).toBe(true);
    if (orchard.ok) {
      expect(orchard.events.some((event) => event.narration.includes("walks with you"))).toBe(false);
    }

    const which = handleTake(world, { verb: "take", characterId: "char-rowan", target: "weapon" }, clock);
    expect(which.ok).toBe(false);
    if (!which.ok) {
      expect(which.message).toContain("Which weapon?");
      expect(which.message).toContain("take Practice Sword");
      expect(which.message).toContain("take Practice Staff");
    }

    const sword = handleTake(
      world,
      { verb: "take", characterId: "char-rowan", target: "Practice Sword" },
      clock,
    );
    expect(sword.ok).toBe(true);
    if (sword.ok) {
      expect(sword.persist).toBe(false);
      expect(sword.events[0]?.narration).toContain("feels right in your hand");
    }
    expect(world.items?.["item-practice-sword-south-orchard"]?.roomId).toBe("south-orchard");
    expect(world.characters["char-rowan"]?.equippedItemId).toBe("practice-sword");

    const staff = handleTake(
      world,
      { verb: "take", characterId: "char-rowan", target: "Practice Staff" },
      clock,
    );
    expect(staff.ok).toBe(true);
    if (staff.ok) {
      expect(staff.events[0]?.narration).toContain("feels unwieldy");
      expect(staff.events[0]?.narration).toContain("poor fit");
    }

    const replied = handleSay(world, { verb: "say", characterId: "char-rowan", text: "1" }, clock);
    expect(replied.ok).toBe(true);
    if (replied.ok) {
      expect(replied.events[0]?.type).toBe("system.notice");
      expect(replied.events[0]?.narration).toContain("Hares prefer the sword");
    }

    const roomSpeech = handleSay(world, { verb: "say", characterId: "char-rowan", text: "hello" }, clock);
    expect(roomSpeech.ok).toBe(true);
    if (roomSpeech.ok) {
      expect(roomSpeech.events[0]?.type).toBe("chat.said");
    }

    const talked = handleTalk(world, { verb: "talk", characterId: "char-rowan", target: "flint" }, clock);
    expect(talked.ok).toBe(true);
    if (talked.ok) {
      expect(talked.events[0]?.narration).toContain("Type say 1");
    }
  });
});
