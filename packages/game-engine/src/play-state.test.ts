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
        fixtures: [],
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
    expect(snapshot?.room.visible).toHaveLength(1);
    expect(snapshot?.room.visible[0]?.visual).toMatchObject({
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
      { id: "court", x: 0, y: 0, state: "current", title: "Court" },
      { id: "hall", x: 0, y: 1, state: "unknown" },
    ]);
    expect(snapshot?.minimap.paths).toEqual([{ from: "court", to: "hall" }]);
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
      { id: "court", x: 0, y: 0, state: "explored", title: "Court" },
      { id: "hall", x: 0, y: 1, state: "current", title: "Unseen hall" },
    ]);
    expect(snapshot?.minimap.paths).toEqual([{ from: "court", to: "hall" }]);
    expect(snapshot?.room.visible.map((entity) => entity.id)).toEqual(["distant"]);
    expect(snapshot?.character.visual).toEqual({
      speciesId: "unknown",
      gender: "female",
      appearance: DEFAULT_APPEARANCE,
    });
    expect(createPlayState(world, "missing")).toBeUndefined();
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
      expect(chart.event.narration).toContain("You are in Court.");
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
});
