import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { mapDiscoveredEventSchema, roomSnapshotEventSchema } from "@greenwood/contracts";
import { describe, expect, it } from "vitest";
import { handleLook } from "./look.js";
import { handleMove } from "./move.js";
import type { EngineRuntime, WorldState } from "./state.js";

function threeRooms(): WorldState {
  return {
    rooms: {
      "lantern-court": {
        id: "lantern-court",
        title: "Lantern Court",
        shortDescription: "A circular courtyard under drifting blue lanterns.",
        longDescription:
          "Ancient oak branches arch over a circular courtyard.\nBlue lanterns drift between the leaves.",
        zone: "academy-core",
        exits: [
          { direction: "north", toRoomId: "great-hall" },
          { direction: "east", toRoomId: "east-gate" },
          { direction: "west", toRoomId: "west-cloister" },
        ],
        fixtures: [{ id: "npc-porter-bramble", name: "Porter Bramble", kind: "npc" }],
      },
      "great-hall": {
        id: "great-hall",
        title: "Great Hall",
        shortDescription: "A high oak hall lit by hanging lanterns.",
        longDescription:
          "Long tables run beneath oak beams.\nSchool banners hang between the lanterns.",
        zone: "academy-core",
        exits: [{ direction: "south", toRoomId: "lantern-court" }],
        fixtures: [],
      },
      "west-cloister": {
        id: "west-cloister",
        title: "West Cloister",
        shortDescription: "A mossy covered walk beside the court.",
        longDescription:
          "Stone arches frame a quiet walk.\nMoss holds the rain in small bright beads.",
        zone: "academy-core",
        exits: [{ direction: "east", toRoomId: "lantern-court" }],
        fixtures: [],
      },
    },
    characters: {
      "char-rowan": {
        id: "char-rowan",
        name: "Rowan the Hare",
        roomId: "lantern-court",
        discoveredRoomIds: ["lantern-court"],
      },
    },
  };
}

function countingRuntime(): EngineRuntime {
  let sequence = 0;
  let event = 0;
  return {
    now: () => new Date("2026-09-03T21:00:00.000Z"),
    nextEventId: () => `evt-move-${String((event += 1))}`,
    nextSequence: () => (sequence += 1),
  };
}

describe("handleMove", () => {
  it("moves among the three rooms and sequences discovery then snapshot", () => {
    const world = threeRooms();
    const runtime = countingRuntime();
    const north = handleMove(
      world,
      { verb: "move", direction: "north", characterId: "char-rowan" },
      runtime,
    );

    expect(north.ok).toBe(true);
    if (!north.ok) {
      return;
    }

    expect(world.characters["char-rowan"]?.roomId).toBe("great-hall");
    expect(world.characters["char-rowan"]?.discoveredRoomIds).toEqual([
      "lantern-court",
      "great-hall",
    ]);
    expect(north.events).toHaveLength(2);
    const discovered = mapDiscoveredEventSchema.parse(north.events[0]);
    const snapshot = roomSnapshotEventSchema.parse(north.events[1]);
    expect(discovered.sequence).toBe(1);
    expect(snapshot.sequence).toBe(2);
    expect(discovered.narration).toBe("You have discovered Great Hall.");
    expect(snapshot.payload.title).toBe("Great Hall");

    const westFromCourt = handleMove(
      world,
      { verb: "move", direction: "south", characterId: "char-rowan" },
      runtime,
    );
    expect(westFromCourt.ok).toBe(true);
    if (!westFromCourt.ok) {
      return;
    }
    expect(world.characters["char-rowan"]?.roomId).toBe("lantern-court");

    const cloister = handleMove(
      world,
      { verb: "move", direction: "west", characterId: "char-rowan" },
      runtime,
    );
    expect(cloister.ok).toBe(true);
    if (!cloister.ok) {
      return;
    }
    expect(world.characters["char-rowan"]?.roomId).toBe("west-cloister");
    expect(cloister.events[0]?.type).toBe("map.discovered");
  });

  it("does not move through a missing exit or a closed path", () => {
    const world = threeRooms();
    const south = handleMove(
      world,
      { verb: "move", direction: "south", characterId: "char-rowan" },
      countingRuntime(),
    );
    expect(south).toMatchObject({
      ok: false,
      code: "no_exit",
    });
    if (!south.ok) {
      expect(south.message).toContain("Exits: north, east, west");
    }
    expect(world.characters["char-rowan"]?.roomId).toBe("lantern-court");

    const east = handleMove(
      world,
      { verb: "move", direction: "east", characterId: "char-rowan" },
      countingRuntime(),
    );
    expect(east).toEqual({
      ok: false,
      code: "exit_closed",
      message: "The way east is not open yet.",
    });
    expect(world.characters["char-rowan"]?.roomId).toBe("lantern-court");
  });

  it("does not rediscover a room already visited", () => {
    const world = threeRooms();
    const runtime = countingRuntime();
    const first = handleMove(
      world,
      { verb: "move", direction: "north", characterId: "char-rowan" },
      runtime,
    );
    const back = handleMove(
      world,
      { verb: "move", direction: "south", characterId: "char-rowan" },
      runtime,
    );
    const again = handleMove(
      world,
      { verb: "move", direction: "north", characterId: "char-rowan" },
      runtime,
    );

    expect(first.ok && first.events).toHaveLength(2);
    expect(back.ok && back.events).toHaveLength(1);
    expect(again.ok && again.events).toHaveLength(1);
    if (again.ok) {
      expect(again.events[0]?.type).toBe("room.snapshot");
      expect(again.events[0]?.sequence).toBe(4);
    }
  });

  it("lets look see the room after movement", () => {
    const world = threeRooms();
    handleMove(
      world,
      { verb: "move", direction: "north", characterId: "char-rowan" },
      countingRuntime(),
    );
    const look = handleLook(world, { verb: "look", characterId: "char-rowan" }, countingRuntime());
    expect(look.ok).toBe(true);
    if (look.ok) {
      expect(look.event.payload.title).toBe("Great Hall");
    }
  });

  it("does not import web, socket, or database libraries", () => {
    const source = readFileSync(fileURLToPath(new URL("./move.ts", import.meta.url)), "utf8");
    expect(source).not.toMatch(/fastify|react|socket\.io|drizzle|postgres|node:pg/i);
  });
});
