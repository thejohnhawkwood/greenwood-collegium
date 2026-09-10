import { describe, expect, it } from "vitest";
import {
  handleExamine,
  handleJoin,
  handleMove,
  handleTalk,
  parsePlayerCommand,
  progressQuests,
  type EngineRuntime,
  type WorldState,
} from "@greenwood/game-engine";
import { createDevWorld } from "./dev-world.js";

const routes = [
  {
    id: "the-missing-pages",
    reward: 10,
    commands: [
      "north",
      "west",
      "talk quill",
      "west",
      "x ink blotter",
      "east",
      "east",
      "north",
      "west",
      "x folded page",
      "east",
      "south",
      "west",
      "talk quill",
    ],
  },
  {
    id: "a-little-room-to-grow",
    reward: 10,
    commands: [
      "south",
      "west",
      "talk tansy",
      "north",
      "x seedling tray",
      "south",
      "east",
      "east",
      "x watering jug",
      "west",
      "north",
      "east",
      "north",
      "east",
      "talk fen",
      "west",
      "south",
      "west",
      "south",
      "west",
      "talk tansy",
    ],
  },
  {
    id: "the-bell-below",
    reward: 15,
    commands: [
      "north",
      "talk alder",
      "north",
      "east",
      "x empty bell frame",
      "west",
      "south",
      "west",
      "north",
      "x bell ledger",
      "south",
      "east",
      "south",
      "south",
      "west",
      "west",
      "x listening stone",
      "east",
      "east",
      "north",
      "north",
      "talk alder",
    ],
  },
];

function run(world: WorldState, characterId: string, raw: string, runtime: EngineRuntime) {
  const intent = parsePlayerCommand(raw, characterId);
  if (!intent) throw new Error(`Unrecognised route command: ${raw}`);
  if (intent.verb === "talk") {
    const result = handleTalk(world, intent, runtime);
    if (!result.ok) throw new Error(`${raw}: ${result.message}`);
    return result.events;
  }
  if (intent.verb === "examine") {
    const result = handleExamine(world, intent, runtime);
    if (!result.ok) throw new Error(`${raw}: ${result.message}`);
    return [
      result.event,
      ...progressQuests(
        world,
        { characterId, kind: "examine", targetId: result.targetId },
        runtime,
      ),
    ];
  }
  if (intent.verb === "move") {
    const result = handleMove(world, intent, runtime);
    if (!result.ok) throw new Error(`${raw}: ${result.message}`);
    return [...result.events, ...progressQuests(world, { characterId, kind: "move" }, runtime)];
  }
  throw new Error(`Unsupported route verb ${intent.verb}`);
}

describe("playable adventures on the existing map", () => {
  for (const route of routes) {
    it(`lets 30 Collegians independently finish ${route.id} without consuming shared clues`, () => {
      const world = createDevWorld();
      let sequence = 0;
      const runtime: EngineRuntime = {
        now: () => new Date("2026-09-10T12:00:00Z"),
        nextEventId: () => `event-${++sequence}`,
        nextSequence: () => ++sequence,
      };
      const fixturesBefore = JSON.stringify(
        Object.values(world.rooms).map((room) => room.fixtures),
      );
      const students = Array.from({ length: 30 }, (_, index) => `fictional-student-${index}`);
      for (const id of students) {
        expect(
          handleJoin(
            world,
            { verb: "join", characterId: id, name: id, roomId: "lantern-court" },
            runtime,
          ).ok,
        ).toBe(true);
      }
      // Interleave the class at each step to expose shared-clue and shared-progress bugs.
      for (const command of route.commands)
        for (const id of students) run(world, id, command, runtime);
      for (const id of students) {
        expect(world.quests?.[id]?.[route.id]).toMatchObject({
          status: "completed",
          rewardGranted: true,
        });
        expect(world.characters[id]?.experience).toBe(route.reward);
        const again = run(world, id, route.commands.at(-1) ?? "", runtime);
        expect(again.some((event) => event.type === "progress.experience_gained")).toBe(false);
        expect(world.characters[id]?.experience).toBe(route.reward);
      }
      expect(JSON.stringify(Object.values(world.rooms).map((room) => room.fixtures))).toBe(
        fixturesBefore,
      );
    });
  }
});
