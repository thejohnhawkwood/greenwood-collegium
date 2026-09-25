import { describe, expect, it } from "vitest";
import { handleEquip, handleUnequip } from "./equip.js";
import { handleExamine } from "./examine.js";
import { handleMove } from "./move.js";
import { DEFAULT_ADMISSION_REFUSAL } from "./worn-world.js";
import type { EngineRuntime, WorldState } from "./state.js";

function runtime(): EngineRuntime {
  let sequence = 0;
  let events = 0;
  return {
    now: () => new Date("2026-09-24T20:00:00.000Z"),
    nextEventId: () => `evt-worn-${String((events += 1))}`,
    nextSequence: () => (sequence += 1),
  };
}

/** H2. A costume is an ordinary item in a real slot that changes two things. */
function world(): WorldState {
  return {
    rooms: {
      bank: {
        id: "bank",
        title: "Reed Bank",
        shortDescription: "Reeds.",
        longDescription: "Slow water.",
        zone: "grounds",
        exits: [{ direction: "south", toRoomId: "camp" }],
        fixtures: [],
      },
      camp: {
        id: "camp",
        title: "Closed Camp",
        shortDescription: "Tarps.",
        longDescription: "A camp that does not want you.",
        zone: "grounds",
        admissionRefusal: "A sentry steps into the gap and looks at your empty collar.",
        exits: [{ direction: "north", toRoomId: "bank" }],
        fixtures: [],
      },
      quiet: {
        id: "quiet",
        title: "Quiet Room",
        shortDescription: "Nothing.",
        longDescription: "No door keeps this one.",
        zone: "grounds",
        exits: [{ direction: "east", toRoomId: "bank" }],
        fixtures: [],
      },
    },
    characters: {
      "char-rowan": {
        id: "char-rowan",
        name: "Rowan",
        roomId: "bank",
        discoveredRoomIds: ["bank"],
        examineDescription: "A hare in Academy grey.",
      },
      "char-moss": {
        id: "char-moss",
        name: "Moss",
        roomId: "bank",
        discoveredRoomIds: ["bank"],
        examineDescription: "A mole in Academy grey.",
      },
    },
    items: {
      "sentry-mask-1": {
        id: "sentry-mask-1",
        templateId: "sentry-mask",
        name: "Sentry Mask",
        examineDescription: "Tarred leather.",
        holderCharacterId: "char-rowan",
        equipSlot: "helmet",
      },
    },
    itemTemplates: {
      "sentry-mask": {
        id: "sentry-mask",
        name: "Sentry Mask",
        examineDescription: "Tarred leather.",
        category: "ordinary",
        equipSlot: "helmet",
        examineRider:
          "They are wearing a river-thief's tarred mask, and the camp's mark is on the brow.",
        admitsRoomId: "camp",
      },
    },
  };
}

describe("a worn piece changes the world", () => {
  it("turns you away from a closed camp in plain words, then lets you in", () => {
    const state = world();
    const clock = runtime();

    const refused = handleMove(
      state,
      { verb: "move", characterId: "char-rowan", direction: "south" },
      clock,
    );
    expect(refused).toMatchObject({
      ok: false,
      code: "exit_closed",
      message: "A sentry steps into the gap and looks at your empty collar.",
    });
    expect(state.characters["char-rowan"]?.roomId).toBe("bank");

    expect(
      handleEquip(state, { verb: "equip", characterId: "char-rowan", target: "mask" }, clock).ok,
    ).toBe(true);
    expect(
      handleMove(state, { verb: "move", characterId: "char-rowan", direction: "south" }, clock).ok,
    ).toBe(true);
    expect(state.characters["char-rowan"]?.roomId).toBe("camp");

    // Taking it off inside does not eject you, but you cannot walk back in.
    handleUnequip(state, { verb: "unequip", characterId: "char-rowan", target: "helmet" }, clock);
    handleMove(state, { verb: "move", characterId: "char-rowan", direction: "north" }, clock);
    expect(state.characters["char-rowan"]?.roomId).toBe("bank");
    expect(
      handleMove(state, { verb: "move", characterId: "char-rowan", direction: "south" }, clock),
    ).toMatchObject({ ok: false, code: "exit_closed" });
  });

  it("leaves a room nothing claims to admit wide open", () => {
    const state = world();
    state.characters["char-rowan"]!.roomId = "quiet";
    state.rooms.quiet!.exits = [{ direction: "east", toRoomId: "bank" }];
    expect(
      handleMove(state, { verb: "move", characterId: "char-rowan", direction: "east" }, runtime())
        .ok,
    ).toBe(true);
  });

  it("adds the rider when a classmate examines the wearer, and drops it when taken off", () => {
    const state = world();
    const clock = runtime();
    handleEquip(state, { verb: "equip", characterId: "char-rowan", target: "mask" }, clock);

    const seen = handleExamine(
      state,
      { verb: "examine", characterId: "char-moss", target: "Rowan" },
      clock,
    );
    expect(seen.ok).toBe(true);
    if (seen.ok) {
      expect(seen.event.narration).toContain("A hare in Academy grey.");
      expect(seen.event.narration).toContain("tarred mask");
    }

    handleUnequip(state, { verb: "unequip", characterId: "char-rowan", target: "helmet" }, clock);
    const plain = handleExamine(
      state,
      { verb: "examine", characterId: "char-moss", target: "Rowan" },
      clock,
    );
    expect(plain.ok).toBe(true);
    if (plain.ok) {
      expect(plain.event.narration).not.toContain("tarred mask");
    }
  });

  it("falls back to a default refusal when the room wrote none", () => {
    const state = world();
    delete state.rooms.camp!.admissionRefusal;
    expect(
      handleMove(state, { verb: "move", characterId: "char-rowan", direction: "south" }, runtime()),
    ).toMatchObject({ ok: false, message: DEFAULT_ADMISSION_REFUSAL });
  });
});
