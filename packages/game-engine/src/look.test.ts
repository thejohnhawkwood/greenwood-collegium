import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderClassicNarration, roomSnapshotEventSchema } from "@greenwood/contracts";
import { describe, expect, it } from "vitest";
import { handleLook } from "./look.js";
import type { EngineRuntime, WorldState } from "./state.js";

const lanternCourtWorld = (): WorldState => ({
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
  },
  characters: {
    "char-rowan": {
      id: "char-rowan",
      name: "Rowan the Hare",
      roomId: "lantern-court",
    },
    "char-observer": {
      id: "char-observer",
      name: "Moss the Mole",
      roomId: "lantern-court",
    },
  },
});

const runtime: EngineRuntime = {
  now: () => new Date("2026-09-03T21:00:00.000Z"),
  nextEventId: () => "evt-look-1",
  nextSequence: () => 1,
};

describe("handleLook", () => {
  it("emits a validated room.snapshot without web or database", () => {
    const result = handleLook(
      lanternCourtWorld(),
      { verb: "look", characterId: "char-observer" },
      runtime,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const event = roomSnapshotEventSchema.parse(result.event);
    const text = renderClassicNarration(event);
    expect(text).toContain("Lantern Court");
    expect(text).toContain("Porter Bramble");
    expect(text).toContain("Rowan the Hare");
    expect(text).toContain("Exits: north, east, west");
    expect(text).not.toContain("Moss the Mole");
  });

  it("hides the looking character from You see", () => {
    const result = handleLook(
      lanternCourtWorld(),
      { verb: "look", characterId: "char-rowan" },
      runtime,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.event.narration).not.toContain("Rowan the Hare");
    expect(result.event.narration).toContain("Porter Bramble");
  });

  it("fails when the character is unknown", () => {
    const result = handleLook(
      lanternCourtWorld(),
      { verb: "look", characterId: "char-missing" },
      runtime,
    );

    expect(result).toEqual({
      ok: false,
      code: "character_not_found",
      message: 'I do not recognize character "char-missing".',
    });
  });

  it("fails when the character room is missing", () => {
    const world = lanternCourtWorld();
    const rowan = world.characters["char-rowan"];
    if (!rowan) {
      throw new Error("expected rowan");
    }
    rowan.roomId = "missing-room";

    const result = handleLook(world, { verb: "look", characterId: "char-rowan" }, runtime);
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.code).toBe("room_not_found");
  });

  it("does not import web, socket, or database libraries", () => {
    const source = readFileSync(fileURLToPath(new URL("./look.ts", import.meta.url)), "utf8");
    expect(source).not.toMatch(/fastify|react|socket\.io|drizzle|postgres|node:pg/i);
  });
});
