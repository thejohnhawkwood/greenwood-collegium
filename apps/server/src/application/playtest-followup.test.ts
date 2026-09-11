import { describe, expect, it } from "vitest";
import {
  ARRIVAL_QUEST_ID,
  handleJoin,
  handleLook,
  handleMove,
  handleSay,
  handleStats,
  handleTake,
  handleTalk,
  parsePlayerCommand,
  progressQuests,
  type EngineRuntime,
  type WorldState,
} from "@greenwood/game-engine";
import { createDevWorld } from "./dev-world.js";

function runtime(): EngineRuntime {
  let sequence = 0;
  return {
    now: () => new Date("2026-09-11T18:30:00.000Z"),
    nextEventId: () => `synthetic-${String((sequence += 1))}`,
    nextSequence: () => sequence,
    random: () => 0.5,
  };
}

function run(world: WorldState, characterId: string, raw: string, clock: EngineRuntime) {
  const intent = parsePlayerCommand(raw, characterId);
  if (!intent) {
    throw new Error(`Unrecognised command: ${raw}`);
  }
  if (intent.verb === "look") {
    const result = handleLook(world, intent, clock);
    if (!result.ok) throw new Error(`${raw}: ${result.message}`);
    return [result.event, ...progressQuests(world, { characterId, kind: "look" }, clock)];
  }
  if (intent.verb === "say") {
    const result = handleSay(world, intent, clock);
    if (!result.ok) throw new Error(`${raw}: ${result.message}`);
    return [...result.events, ...progressQuests(world, { characterId, kind: "say" }, clock)];
  }
  if (intent.verb === "take") {
    const result = handleTake(world, intent, clock);
    if (!result.ok) throw new Error(`${raw}: ${result.message}`);
    return [...result.events, ...progressQuests(world, { characterId, kind: "take" }, clock)];
  }
  if (intent.verb === "move") {
    const result = handleMove(world, intent, clock);
    if (!result.ok) throw new Error(`${raw}: ${result.message}`);
    return [...result.events, ...progressQuests(world, { characterId, kind: "move" }, clock)];
  }
  if (intent.verb === "stats") {
    const result = handleStats(world, intent, clock);
    if (!result.ok) throw new Error(`${raw}: ${result.message}`);
    return [result.event];
  }
  if (intent.verb === "talk") {
    const result = handleTalk(world, intent, clock);
    if (!result.ok) throw new Error(`${raw}: ${result.message}`);
    return result.events;
  }
  throw new Error(`Unsupported command: ${raw}`);
}

describe("synthetic Collegian on bundled content", () => {
  it("finishes Arrival, reprints the room, and tries training weapons", () => {
    const world = createDevWorld();
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
    expect(joined.events.some((event) => event.narration.includes("take Small Copper Key"))).toBe(
      true,
    );

    const failed = handleTake(world, { verb: "take", characterId: "char-rowan", target: "key" }, clock);
    expect(failed.ok).toBe(false);
    if (!failed.ok) {
      expect(failed.message).toContain("take Small Copper Key");
    }

    const events = [
      ...run(world, "char-rowan", "look", clock),
      ...run(world, "char-rowan", "say hello", clock),
      ...run(world, "char-rowan", "take Small Copper Key", clock),
      ...run(world, "char-rowan", "where", clock),
      ...run(world, "char-rowan", "stats", clock),
      ...run(world, "char-rowan", "north", clock),
    ];
    expect(events.some((event) => event.narration.includes("Lantern Court"))).toBe(true);
    expect(events.some((event) => event.narration.includes("Health:"))).toBe(true);
    expect(events.some((event) => event.narration.includes("walks with you"))).toBe(true);
    expect(world.quests?.["char-rowan"]?.[ARRIVAL_QUEST_ID]?.status).toBe("completed");

    run(world, "char-rowan", "south", clock);
    run(world, "char-rowan", "south", clock);
    const which = handleTake(world, { verb: "take", characterId: "char-rowan", target: "weapon" }, clock);
    expect(which.ok).toBe(false);
    if (!which.ok) {
      expect(which.message).toContain("Which weapon?");
      expect(which.message).toContain("take Practice Sword");
    }
    const sword = run(world, "char-rowan", "take Practice Sword", clock);
    expect(sword.some((event) => event.narration.includes("feels right"))).toBe(true);
    const staff = run(world, "char-rowan", "take Practice Staff", clock);
    expect(staff.some((event) => event.narration.includes("unwieldy"))).toBe(true);
    const tree = run(world, "char-rowan", "say 1", clock);
    expect(tree.some((event) => event.narration.includes("proficiency") || event.narration.includes("sword"))).toBe(
      true,
    );
    const flint = run(world, "char-rowan", "talk flint", clock);
    expect(flint.some((event) => event.narration.includes("Type say"))).toBe(true);
  });
});
