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
    expect(Object.keys(world.rooms)).toHaveLength(25);
    expect(world.rooms[START_ROOM_ID]?.title).toBe("Lantern Court");
    expect(world.rooms[START_ROOM_ID]?.fixtures).toEqual([
      { id: "npc-porter-bramble", name: "Porter Bramble", kind: "npc" },
    ]);
    expect(world.rooms["east-gate"]).toBeDefined();
    expect(world.rooms["west-cloister"]?.exits).toEqual([
      { direction: "east", toRoomId: START_ROOM_ID },
    ]);
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
    expect(Object.keys(world.rooms)).toHaveLength(26);
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
});
