import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { contentReady, loadBundledWorld, loadWorldFromDirectory } from "./index.js";
import { START_ROOM_ID } from "./schema.js";
import { ContentValidationError } from "./validate.js";
import { bundledRoomsDirectory } from "./load.js";

const ROOM_SCHEMA = "../schemas/room.schema.json";

function writeRoom(directory: string, id: string, overrides: Record<string, unknown> = {}): void {
  const room = {
    $schema: ROOM_SCHEMA,
    id,
    title: "Test Room",
    shortDescription: "A test room.",
    longDescription: "A longer test room.",
    zone: "academy-core",
    unmapped: true,
    exits: [{ direction: "south", toRoomId: START_ROOM_ID }],
    fixtures: [],
    ...overrides,
  };
  writeFileSync(join(directory, `${id}.json`), `${JSON.stringify(room, null, 2)}\n`);
}

describe("content loader", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const directory of tempDirs.splice(0)) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("is ready once room files can load", () => {
    expect(contentReady).toBe(true);
  });

  it("loads twenty-five bundled rooms without an import list", () => {
    const world = loadBundledWorld();
    expect(Object.keys(world.rooms)).toHaveLength(66);
    expect(world.rooms[START_ROOM_ID]?.map).toEqual({ x: 0, y: 0 });
    expect(world.rooms["great-hall"]?.map).toEqual({ x: 0, y: 1 });
    const charted = Object.values(world.rooms).filter((room) => room.map);
    expect(charted).toHaveLength(66);
    expect(
      new Set(charted.map((room) => `${room.map!.x},${room.map!.y},${String(room.map!.z ?? 0)}`))
        .size,
    ).toBe(66);
    expect(world.rooms["headmaster-study"]?.map).toEqual({ x: 0, y: 1, z: 1 });
    expect(world.rooms["bell-stair"]?.map).toEqual({ x: 1, y: 2, z: -1 });
    expect(world.rooms["deep-cradle"]?.map).toEqual({ x: 2, y: 0, z: -2 });
    expect(world.rooms["north-quad"]?.map).toEqual({ x: 0, y: 2 });
    expect(world.rooms["observatory"]?.map).toEqual({ x: 0, y: 3 });
    expect(world.rooms["library-stacks"]?.map).toEqual({ x: -2, y: 1 });
    expect(world.rooms["porter-lodge"]?.map).toEqual({ x: 1, y: 1 });
    expect(world.rooms["river-landing"]?.map).toEqual({ x: 0, y: -2 });
    expect(world.rooms[START_ROOM_ID]?.title).toBe("Lantern Court");
    expect(world.rooms[START_ROOM_ID]?.visualState).toBe(START_ROOM_ID);
    expect(world.rooms[START_ROOM_ID]?.fixtures).toEqual([
      expect.objectContaining({
        id: "npc-porter-bramble",
        name: "Porter Bramble",
        kind: "npc",
        lookDescription:
          "A sturdy hedgehog porter in a worn brown coat, brass whistle on a leather cord. Try talk porter.",
        examineDescription: expect.stringContaining("whistle is for calling help"),
        dialogue: expect.stringContaining("school"),
      }),
      expect.objectContaining({ id: "object-noticeboard", kind: "object" }),
      expect.objectContaining({ id: "object-courtyard-well", kind: "object" }),
    ]);
    expect(world.rooms["east-gate"]).toBeDefined();
    expect(world.rooms["deep-cradle"]?.title).toBe("Deep Cradle");
    expect(world.rooms["cocoon-nave"]?.fixtures.map((fixture) => fixture.id)).toContain(
      "object-holm-wrapping",
    );
    expect(world.rooms["east-meadow"]?.exits).toEqual(
      expect.arrayContaining([{ direction: "north", toRoomId: "moor-track" }]),
    );
    expect(world.rooms["moor-track"]?.map).toEqual({ x: 6, y: 1 });
    expect(world.rooms["moor-track"]?.visualState).toBe("moor-track");
    expect(world.rooms["wren-croft"]?.title).toBe("Wren's Croft");
    expect(world.rooms["kitchens"]?.fixtures.map((fixture) => fixture.id)).toContain(
      "object-kitchen-initials",
    );
    expect(world.itemTemplates["abbey-mark-rubbing"]?.name).toBe("Abbey Mark Rubbing");
    expect(world.rooms["wren-croft"]?.visualState).toBe("wren-croft");
    expect(world.rooms["barrow-nave"]?.visualState).toBe("barrow-nave");
    expect(world.rooms["west-cloister"]?.exits).toEqual([
      { direction: "east", toRoomId: START_ROOM_ID },
    ]);
    expect(world.items["item-copper-key-lantern-court"]).toBeUndefined();
    expect(world.starterPlacements).toEqual([
      expect.objectContaining({
        id: "item-abbey-mark-rubbing-standing-stones",
        templateId: "abbey-mark-rubbing",
        name: "Abbey Mark Rubbing",
        roomId: "standing-stones",
      }),
      expect.objectContaining({
        id: "item-copper-key-lantern-court",
        templateId: "small-copper-key",
        name: "Small Copper Key",
        roomId: START_ROOM_ID,
      }),
      expect.objectContaining({
        id: "item-field-primer-lantern-court",
        templateId: "field-primer",
        name: "Field Primer Book",
        roomId: START_ROOM_ID,
      }),
      expect.objectContaining({
        id: "item-practice-sling-south-orchard",
        templateId: "practice-sling",
        roomId: "south-orchard",
      }),
      expect.objectContaining({
        id: "item-practice-staff-south-orchard",
        templateId: "practice-staff",
        roomId: "south-orchard",
      }),
      expect.objectContaining({
        id: "item-practice-sword-south-orchard",
        templateId: "practice-sword",
        roomId: "south-orchard",
      }),
    ]);
    expect(world.itemTemplates["small-copper-key"]?.name).toBe("Small Copper Key");
    expect(world.itemTemplates["librarians-ribbon"]?.name).toBe("Librarian's Ribbon");
    expect(world.quests["the-missing-pages"]?.itemRewardTemplateId).toBe("librarians-ribbon");
    expect(Object.keys(world.items)).toHaveLength(1);
    expect(world.enemies["enemy-practice-dummy-south-orchard"]).toMatchObject({
      templateId: "practice-dummy",
      name: "Practice Dummy",
      roomId: "south-orchard",
      maxHealth: 8,
      maxFocus: 6,
      attack: 2,
      experience: 0,
      reads: ["lunge", "brace", "gather"],
    });
    expect(world.enemies["enemy-silk-queen-deep-cradle"]).toMatchObject({
      templateId: "silk-queen",
      roomId: "deep-cradle",
      maxHealth: 28,
      maxFocus: 12,
      minParty: 3,
      victoryNarration: expect.stringContaining("folds in on herself"),
      lockNarration: "Threads tighten around the cradle.",
    });
    expect(world.enemies["enemy-fog-walker-fog-hollow"]).toMatchObject({
      templateId: "fog-walker",
      minParty: 3,
      lockNarration: "Fog thickens and does not keep footprints.",
    });
    expect(world.enemies["enemy-peat-adder-peat-cut"]).toMatchObject({
      templateId: "peat-adder",
      roomId: "peat-cut",
      maxHealth: 10,
      attack: 3,
      experience: 8,
    });
    expect(Object.keys(world.enemies)).toHaveLength(20);
    expect(world.spells.ember).toMatchObject({
      name: "Ember",
      focusCost: 4,
      damage: 5,
      burningRounds: 2,
      presentationKey: "ember-burst",
    });
    expect(Object.keys(world.spells)).toHaveLength(42);
    expect(world.spells.strike).toMatchObject({ name: "Strike", school: "steel", minLevel: 3 });
    expect(world.spells.shade).toMatchObject({
      name: "Shade",
      school: "veil",
      tag: "strike",
      damage: 6,
    });
    expect(world.spells.hush).toMatchObject({
      name: "Hush",
      school: "veil",
      tag: "strike",
      damage: 8,
      targetType: "enemy",
    });
    expect(world.spells["after-image"]).toMatchObject({ damage: 4, effect: "skip-counter" });
    expect(world.spells.unname).toMatchObject({ damage: 4, effect: "weaken" });
    expect(world.spells.azimuth).toMatchObject({
      name: "Azimuth",
      school: "stars",
      tag: "strike",
      damage: 5,
    });
    expect(world.spells.flare).toMatchObject({
      name: "Flare",
      school: "stars",
      tag: "strike",
      damage: 4,
      burningRounds: 2,
      burningDamage: 1,
    });
    expect(world.spells.draw).toMatchObject({
      name: "Draw",
      school: "steel",
      tag: "strike",
      damage: 4,
      heal: 2,
      effect: "leech",
    });
    expect(world.spells.measure).toBeUndefined();
    expect(world.quests["arrival-at-the-collegium"]).toMatchObject({
      title: "Arrival at the Collegium",
      experienceReward: 10,
    });
    expect(world.quests["what-still-sleeps"]?.title).toBe("What Still Sleeps");
    expect(
      world.quests["what-still-sleeps"]?.objectives.map((objective) => objective.kind),
    ).toContain("defeat");
    expect(world.quests["the-meadow-fork"]?.giverNpcId).toBe("npc-shepherd-wren");
    expect(Object.keys(world.quests)).toHaveLength(41);
    expect(world.quests["arrival-at-the-collegium"]?.introNarration).toContain(
      "train as a defender",
    );
    for (const quest of Object.values(world.quests)) {
      expect(quest.itemRewardTemplateId, quest.id).toBeTruthy();
    }
    for (const enemy of Object.values(world.enemies)) {
      expect(enemy.loot?.length, enemy.id).toBeGreaterThan(0);
    }
    expect(world.rooms["south-orchard"]?.fixtures.map((fixture) => fixture.id)).toContain(
      "object-orchard-apples",
    );
    for (const mentorId of [
      "npc-mentor-cinder",
      "npc-mentor-briar",
      "npc-mentor-mist",
      "npc-mentor-lumen",
      "npc-mentor-quern",
      "npc-mentor-edge",
    ]) {
      const mentor = Object.values(world.rooms)
        .flatMap((room) => room.fixtures)
        .find((fixture) => fixture.id === mentorId);
      expect(mentor?.dialogueTree?.nodes["lessons-done"]?.text).toContain("The stem is inked");
    }
    const alder = Object.values(world.rooms)
      .flatMap((room) => room.fixtures)
      .find((fixture) => fixture.id === "npc-headmaster-alder");
    expect(alder?.dialogueTree?.nodes.welcome?.text.length).toBeGreaterThan(400);
    expect(alder?.dialogueTree?.nodes.welcome?.text).toContain("beeswax");
    const piper = Object.values(world.rooms)
      .flatMap((room) => room.fixtures)
      .find((fixture) => fixture.id === "npc-piper-mole");
    expect(piper?.dialogueTree?.nodes.welcome?.text.length).toBeGreaterThan(400);
    expect(piper?.dialogueTree?.nodes.welcome?.text).toContain("silk");
  });

  it("loads an extra room file without a code change", () => {
    const directory = mkdtempSync(join(tmpdir(), "greenwood-content-"));
    tempDirs.push(directory);
    cpSync(bundledRoomsDirectory, directory, { recursive: true });

    const courtPath = join(directory, "lantern-court.json");
    const court = JSON.parse(readFileSync(courtPath, "utf8")) as {
      exits: Array<{ direction: string; toRoomId: string }>;
    };
    court.exits.push({ direction: "nook", toRoomId: "extra-nook" });
    writeFileSync(courtPath, `${JSON.stringify(court, null, 2)}\n`);
    writeRoom(directory, "extra-nook", {
      title: "Extra Nook",
      shortDescription: "A spare alcove added as data.",
      longDescription: "Someone left a new door in the JSON.",
      exits: [{ direction: "out", toRoomId: START_ROOM_ID }],
    });

    const world = loadWorldFromDirectory(directory);
    expect(Object.keys(world.rooms)).toHaveLength(67);
    expect(world.rooms["extra-nook"]?.title).toBe("Extra Nook");
  });

  it("rejects a missing exit target", () => {
    const directory = mkdtempSync(join(tmpdir(), "greenwood-content-"));
    tempDirs.push(directory);
    writeRoom(directory, START_ROOM_ID, {
      title: "Lantern Court",
      map: { x: 0, y: 0 },
      unmapped: undefined,
      exits: [{ direction: "east", toRoomId: "missing-gate" }],
    });

    expect(() => loadWorldFromDirectory(directory)).toThrow(ContentValidationError);
    try {
      loadWorldFromDirectory(directory);
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError);
      if (error instanceof ContentValidationError) {
        expect(error.issues.some((issue) => issue.code === "missing_exit_target")).toBe(true);
      }
    }
  });

  it("rejects an unreachable room", () => {
    const directory = mkdtempSync(join(tmpdir(), "greenwood-content-"));
    tempDirs.push(directory);
    writeRoom(directory, START_ROOM_ID, {
      title: "Lantern Court",
      map: { x: 0, y: 0 },
      unmapped: undefined,
      exits: [{ direction: "east", toRoomId: START_ROOM_ID }],
    });
    writeRoom(directory, "hidden-cell", {
      title: "Hidden Cell",
      exits: [{ direction: "out", toRoomId: "hidden-cell" }],
    });

    expect(() => loadWorldFromDirectory(directory)).toThrow(/not reachable/);
  });

  it("rejects HTML in descriptions", () => {
    const directory = mkdtempSync(join(tmpdir(), "greenwood-content-"));
    tempDirs.push(directory);
    writeRoom(directory, START_ROOM_ID, {
      title: "Lantern Court",
      longDescription: "A court with <script>alert(1)</script>",
      map: { x: 0, y: 0 },
      unmapped: undefined,
      exits: [{ direction: "east", toRoomId: START_ROOM_ID }],
    });

    expect(() => loadWorldFromDirectory(directory)).toThrow(/plain text/);
  });

  it("rejects duplicate map coordinates", () => {
    const directory = mkdtempSync(join(tmpdir(), "greenwood-content-"));
    tempDirs.push(directory);
    writeRoom(directory, START_ROOM_ID, {
      title: "Lantern Court",
      map: { x: 0, y: 0 },
      unmapped: undefined,
      exits: [{ direction: "east", toRoomId: "twin-court" }],
    });
    writeRoom(directory, "twin-court", {
      title: "Twin Court",
      map: { x: 0, y: 0 },
      unmapped: undefined,
      exits: [{ direction: "west", toRoomId: START_ROOM_ID }],
    });

    expect(() => loadWorldFromDirectory(directory)).toThrow(/shares map coordinates/);
  });

  it("rejects a cardinal exit that faces the wrong way on the map", () => {
    const directory = mkdtempSync(join(tmpdir(), "greenwood-content-"));
    tempDirs.push(directory);
    writeRoom(directory, START_ROOM_ID, {
      title: "Lantern Court",
      map: { x: 0, y: 0 },
      unmapped: undefined,
      exits: [{ direction: "north", toRoomId: "south-nook" }],
    });
    writeRoom(directory, "south-nook", {
      title: "South Nook",
      map: { x: 0, y: -1 },
      unmapped: undefined,
      exits: [{ direction: "south", toRoomId: START_ROOM_ID }],
    });

    expect(() => loadWorldFromDirectory(directory)).toThrow(/does not move y toward/);
  });
});
