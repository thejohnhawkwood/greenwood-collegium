import { describe, expect, it } from "vitest";
import { DEFAULT_APPEARANCE } from "@greenwood/contracts";
import { handleMap } from "./map.js";
import { parseMapCommand } from "./parse-map.js";
import { handleJoin } from "./presence.js";
import { createPlayState } from "./play-state.js";
import type { EngineRuntime, WorldState } from "./state.js";

function fixture(): WorldState {
  return {
    rooms: {
      court: {
        id: "court",
        map: { x: 0, y: 0 },
        title: "Court",
        shortDescription: "A court.",
        longDescription: "A quiet court.",
        zone: "academy",
        exits: [{ direction: "north", toRoomId: "hall" }],
        fixtures: [
          {
            id: "npc-porter-bramble",
            name: "Porter Bramble",
            kind: "npc",
            dialogueTree: {
              start: "greet",
              nodes: {
                greet: {
                  text: "Why a weapon, I wonder?",
                  choices: [{ say: "1", label: "Why does a weapon fit?" }],
                },
              },
            },
          },
        ],
      },
      hall: {
        id: "hall",
        map: { x: 0, y: 1 },
        title: "Unseen hall",
        shortDescription: "Hidden view.",
        longDescription: "Unseen treasure.",
        zone: "academy",
        exits: [],
        fixtures: [],
      },
      secret: {
        id: "secret",
        title: "Hidden vault",
        shortDescription: "A secret.",
        longDescription: "Unseen vault gold.",
        zone: "academy",
        exits: [],
        fixtures: [],
      },
    },
    characters: {
      self: {
        id: "self",
        name: "Fern",
        accountUsername: "private-login",
        speciesId: "fox",
        gender: "female",
        appearance: { ...DEFAULT_APPEARANCE, clothing: "indigo" },
        health: 7,
        maxHealth: 20,
        focus: 3,
        maxFocus: 10,
        level: 2,
        experience: 130,
        roomId: "court",
        discoveredRoomIds: ["court"],
        equippedItemId: "item-sword",
        openConversation: { npcId: "npc-porter-bramble", nodeId: "greet" },
      },
      peer: {
        id: "peer",
        name: "Moss",
        accountUsername: "private-peer",
        speciesId: "mole",
        gender: "male",
        appearance: { ...DEFAULT_APPEARANCE, palette: "ash" },
        roomId: "court",
        discoveredRoomIds: ["court"],
      },
      distant: {
        id: "distant",
        name: "Hidden occupant",
        roomId: "hall",
        discoveredRoomIds: ["hall"],
      },
    },
    questTemplates: {
      arrival: {
        id: "arrival",
        title: "Arrival at the Collegium",
        introNarration: "Porter waits.",
        reminderNarration: "Stay with Porter.",
        experienceReward: 10,
        objectives: [
          {
            id: "look",
            kind: "look",
            label: "Look around Lantern Court. Type look to see Lantern Court.",
          },
          { id: "speak", kind: "say", label: "Say hello so Porter knows you arrived." },
        ],
      },
    },
    quests: {
      self: {
        arrival: {
          questId: "arrival",
          status: "active",
          completedObjectiveIds: ["look"],
          rewardGranted: false,
        },
      },
    },
    items: {
      "item-sword": {
        id: "item-sword",
        templateId: "practice-sword",
        name: "Practice Sword",
        examineDescription: "A wooden blade.",
        holderCharacterId: "self",
        category: "weapon",
      },
      "item-hidden": {
        id: "item-hidden",
        templateId: "hidden-gold",
        name: "Unseen treasure",
        examineDescription: "Hidden gold.",
        holderCharacterId: "distant",
      },
    },
  };
}

function runtime(): EngineRuntime {
  let sequence = 0;
  return {
    now: () => new Date("2026-09-15T21:00:00.000Z"),
    nextEventId: () => "evt-map",
    nextSequence: () => (sequence += 1),
  };
}

describe("visual play projection", () => {
  it("projects real vitals and nearby saved appearances without mutating the world or leaking private data", () => {
    const world = fixture();
    const before = structuredClone(world);
    const snapshot = createPlayState(world, "self");
    expect(snapshot?.character).toMatchObject({
      health: 7,
      focus: 3,
      level: 2,
      experience: 130,
      visual: { speciesId: "fox", gender: "female", appearance: { clothing: "indigo" } },
    });
    expect(snapshot?.room.visible.map((entity) => entity.id)).toEqual([
      "npc-porter-bramble",
      "peer",
    ]);
    expect(snapshot?.room.visible.find((entity) => entity.id === "peer")?.visual).toMatchObject({
      speciesId: "mole",
      gender: "male",
      appearance: { palette: "ash" },
    });
    for (const privateText of [
      "private-login",
      "private-peer",
      "Hidden occupant",
      "Unseen treasure",
      "Unseen hall",
      "Hidden vault",
      "Unseen vault gold",
    ])
      expect(JSON.stringify(snapshot)).not.toContain(privateText);
    expect(snapshot?.minimap.rooms).toEqual([
      { id: "court", x: 0, y: 0, z: 0, state: "current", title: "Court" },
      { id: "hall", x: 0, y: 1, z: 0, state: "unknown" },
    ]);
    expect(snapshot?.minimap.paths).toEqual([{ from: "court", to: "hall" }]);
    expect(snapshot?.conversation).toEqual({
      npcId: "npc-porter-bramble",
      npcName: "Porter Bramble",
      prompt: "Why a weapon, I wonder?",
      choices: [{ say: "1", label: "Why does a weapon fit?" }],
    });
    expect(snapshot?.slots).toHaveLength(11);
    expect(snapshot?.slots.find((slot) => slot.id === "helmet")).toEqual({
      id: "helmet",
      label: "Helmet",
    });
    expect(snapshot?.slots.find((slot) => slot.id === "main-hand")).toMatchObject({
      itemId: "item-sword",
      itemName: "Practice Sword",
    });
    expect(snapshot?.bag).toEqual([
      {
        id: "item-sword",
        name: "Practice Sword",
        equipped: true,
        category: "weapon",
        description: "A wooden blade.",
        slot: "main-hand",
      },
    ]);
    expect(snapshot?.quests).toEqual([
      {
        id: "arrival",
        title: "Arrival at the Collegium",
        status: "active",
        steps: [
          {
            id: "look",
            label: "Look around Lantern Court",
            done: true,
            hint: "Type look to see Lantern Court.",
          },
          { id: "speak", label: "Say hello so Porter knows you arrived.", done: false },
        ],
      },
    ]);
    expect(snapshot?.peers).toEqual([]);
    expect(createPlayState(world, "self", { presentIds: ["peer"] })?.peers).toEqual([
      expect.objectContaining({ name: "Moss", roomTitle: "Court" }),
    ]);
    expect(
      createPlayState(world, "self", { presentIds: ["distant"] })?.peers[0]?.roomTitle,
    ).toBeUndefined();
    expect(world).toEqual(before);
  });
  it("replaces the room and occupants after movement, and handles legacy saves or missing characters", () => {
    const world = fixture();
    const self = world.characters.self!;
    self.roomId = "hall";
    self.speciesId = undefined;
    self.appearance = undefined;
    const snapshot = createPlayState(world, "self");
    expect(snapshot?.room.title).toBe("Unseen hall");
    expect(snapshot?.minimap.rooms).toEqual([
      { id: "court", x: 0, y: 0, z: 0, state: "explored", title: "Court" },
      { id: "hall", x: 0, y: 1, z: 0, state: "current", title: "Unseen hall" },
    ]);
    expect(snapshot?.minimap.paths).toEqual([{ from: "court", to: "hall" }]);
    expect(snapshot?.room.visible.map((entity) => entity.id)).toEqual(["distant"]);
    expect(snapshot?.character.visual).toEqual({
      speciesId: "unknown",
      gender: "female",
      appearance: DEFAULT_APPEARANCE,
    });
    expect(createPlayState(world, "missing")).toBeUndefined();
    const moved = fixture();
    moved.characters.self!.roomId = "hall";
    expect(createPlayState(moved, "self")?.conversation).toBeUndefined();
    const linear = fixture();
    linear.rooms.court!.fixtures[0] = {
      id: "npc-wren",
      name: "Reader Wren",
      kind: "npc",
      dialogue: "Notice before you guess.",
    };
    linear.characters.self!.openConversation = { npcId: "npc-wren" };
    expect(createPlayState(linear, "self")?.conversation).toEqual({
      npcId: "npc-wren",
      npcName: "Reader Wren",
      prompt: "Notice before you guess.",
      choices: [],
    });
  });
  it("restores saved discovery on join and writes a map that never names fogged rooms", () => {
    const world = fixture();
    delete world.characters.self;
    const joined = handleJoin(
      world,
      {
        verb: "join",
        characterId: "self",
        name: "Fern",
        roomId: "court",
        discoveredRoomIds: ["court", "hall"],
      },
      runtime(),
    );
    expect(joined.ok).toBe(true);
    expect(world.characters.self?.discoveredRoomIds).toEqual(["court", "hall"]);
    const chart = handleMap(world, { verb: "map", characterId: "self" }, runtime());
    expect(chart.ok).toBe(true);
    if (chart.ok) {
      expect(chart.event.narration).toContain("You are in Court (Grounds).");
      expect(chart.event.narration).toContain("Explored: Court, Unseen hall.");
      expect(chart.event.narration).toContain("The charted Collegium is known to you.");
      expect(chart.event.narration).not.toContain("Hidden vault");
    }
    const fogged = handleMap(fixture(), { verb: "map", characterId: "self" }, runtime());
    expect(fogged.ok && fogged.event.narration).toContain("1 room remains in fog.");
    expect(fogged.ok && fogged.event.narration).not.toContain("Unseen hall");
    expect(parseMapCommand("chart", "self")).toEqual({ verb: "map", characterId: "self" });
    expect(handleMap(world, { verb: "map", characterId: "missing" }, runtime()).ok).toBe(false);
  });
  it("projects pending Primer leaves as clickable cards with numbers and descriptions", () => {
    const world = fixture();
    world.spells = {
      ember: {
        id: "ember",
        name: "Ember",
        school: "ember",
        description: "A small coal of will that lands and lingers.",
        focusCost: 4,
        targetType: "enemy",
        context: "encounter",
        damage: 5,
        burningRounds: 2,
        pennedBy: "Cinder Wick",
        presentationKey: "ember-burst",
        helpText: "cast ember",
      },
      "flame-breath": {
        id: "flame-breath",
        name: "Flame-Breath",
        school: "ember",
        description: "A gust of open flame. It scorches and leaves one burn.",
        focusCost: 5,
        targetType: "enemy",
        context: "encounter",
        damage: 4,
        burningRounds: 1,
        presentationKey: "ember-burst",
        helpText: "cast flame-breath",
      },
    };
    const self = world.characters.self!;
    self.schoolId = "ember";
    self.pendingPrimerChoices = {
      level: 4,
      options: [
        { kind: "upgrade", spellId: "ember", rank: 2, schoolId: "ember", tag: "strike" },
        { kind: "unlock", spellId: "flame-breath", rank: 1, schoolId: "ember", tag: "strike" },
        { kind: "vital", vitalHealth: 2, vitalFocus: 1 },
      ],
    };
    const snapshot = createPlayState(world, "self");
    expect(snapshot?.primer).toEqual({
      pennedBy: "Mentor Cinder",
      prompt: "Mentor Cinder's hand offers three leaves.",
      cards: [
        {
          command: "1",
          title: "Ember",
          badge: "Rank II",
          kind: "upgrade",
          numbers: "Focus 4. Damage 6. Burns 2.",
          description: "A small coal of will that lands and lingers.",
          pennedBy: "Cinder Wick",
        },
        {
          command: "2",
          title: "Flame-Breath",
          badge: "New",
          kind: "unlock",
          numbers: "Focus 5. Damage 4. Burns 1.",
          description: "A gust of open flame. It scorches and leaves one burn.",
        },
        {
          command: "3",
          title: "Vital leaf",
          badge: "Vital",
          kind: "vital",
          numbers: "+2 health. +1 focus.",
          description: "A thicker page. Your health and focus rise so the next field is kinder.",
        },
      ],
    });
  });
});
