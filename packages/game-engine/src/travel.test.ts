import { describe, expect, it } from "vitest";
import { handleTravel, discoveredPath } from "./travel.js";
import { parseTravelCommand } from "./parse-travel.js";
import type { EngineRuntime, WorldState } from "./state.js";

function world(): WorldState {
  return {
    rooms: {
      court: {
        id: "court",
        map: { x: 0, y: 0 },
        title: "Lantern Court",
        shortDescription: "Court.",
        longDescription: "A court.",
        zone: "academy",
        exits: [{ direction: "west", toRoomId: "hall" }],
        fixtures: [],
      },
      hall: {
        id: "hall",
        map: { x: -1, y: 0 },
        title: "Great Hall",
        shortDescription: "Hall.",
        longDescription: "A hall.",
        zone: "academy",
        exits: [
          { direction: "east", toRoomId: "court" },
          { direction: "west", toRoomId: "stacks" },
        ],
        fixtures: [],
      },
      stacks: {
        id: "stacks",
        map: { x: -2, y: 0 },
        title: "Library Stacks",
        shortDescription: "Stacks.",
        longDescription: "Quiet stacks.",
        zone: "academy",
        exits: [{ direction: "east", toRoomId: "hall" }],
        fixtures: [],
      },
    },
    characters: {
      self: {
        id: "self",
        name: "Fern",
        roomId: "court",
        discoveredRoomIds: ["court", "hall", "stacks"],
      },
      peer: {
        id: "peer",
        name: "Moss",
        roomId: "stacks",
        discoveredRoomIds: ["stacks"],
      },
    },
  };
}

function runtime(): EngineRuntime {
  let sequence = 0;
  return {
    now: () => new Date("2026-09-16T16:00:00Z"),
    nextEventId: () => "evt-travel",
    nextSequence: () => ++sequence,
  };
}

describe("travel", () => {
  it("parses travel and journey", () => {
    expect(parseTravelCommand("travel Library Stacks", "self")).toEqual({
      verb: "travel",
      characterId: "self",
      target: "Library Stacks",
    });
    expect(parseTravelCommand("journey stacks", "self")?.target).toBe("stacks");
    expect(parseTravelCommand("travel", "self")?.target).toBe("");
    expect(parseTravelCommand("look", "self")).toBeNull();
  });

  it("follows a known path and hides fogged names", () => {
    const state = world();
    const result = handleTravel(
      state,
      { verb: "travel", characterId: "self", target: "Library Stacks" },
      runtime(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(state.characters.self?.roomId).toBe("stacks");
    expect(result.events[0]?.narration).toBe("You follow the known paths to Library Stacks.");
    expect(result.events[0]?.type).toBe("system.notice");
    expect(result.notices.map((notice) => notice.characterId)).toEqual(["peer"]);
    expect(discoveredPath(state, "court", "stacks", new Set(["court", "hall", "stacks"]))).toEqual([
      "court",
      "hall",
      "stacks",
    ]);
  });

  it("refuses fog, missing paths, and standing still", () => {
    const state = world();
    state.characters.self!.discoveredRoomIds = ["court"];
    expect(
      handleTravel(
        state,
        { verb: "travel", characterId: "self", target: "Library Stacks" },
        runtime(),
      ).ok,
    ).toBe(false);
    const knownHall = world();
    knownHall.characters.self!.discoveredRoomIds = ["court", "stacks"];
    expect(
      handleTravel(
        knownHall,
        { verb: "travel", characterId: "self", target: "Library Stacks" },
        runtime(),
      ).code,
    ).toBe("no_known_path");
    expect(
      handleTravel(
        world(),
        { verb: "travel", characterId: "self", target: "Lantern Court" },
        runtime(),
      ).code,
    ).toBe("already_there");
  });
});
