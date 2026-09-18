import { describe, expect, it } from "vitest";
import { handleSpells } from "./spells.js";
import { parsePlayerCommand } from "./parse-command.js";
import type { EngineRuntime, WorldState } from "./state.js";

function world(): WorldState {
  return {
    rooms: {
      "lantern-court": {
        id: "lantern-court",
        title: "Lantern Court",
        shortDescription: "A courtyard.",
        longDescription: "Blue lanterns drift.",
        zone: "academy-core",
        exits: [],
        fixtures: [],
      },
    },
    characters: {
      "char-rowan": {
        id: "char-rowan",
        name: "Rowan the Hare",
        roomId: "lantern-court",
        discoveredRoomIds: ["lantern-court"],
        level: 1,
        schoolId: "ember",
      },
    },
    spells: {
      ember: {
        id: "ember",
        name: "Ember",
        school: "ember",
        description: "A practice spark.",
        focusCost: 4,
        targetType: "enemy",
        context: "encounter",
        presentationKey: "ember-burst",
        helpText: "cast ember",
      },
      "cinder-snap": {
        id: "cinder-snap",
        name: "Cinder Snap",
        school: "ember",
        description: "A short spark.",
        focusCost: 3,
        targetType: "enemy",
        context: "encounter",
        minLevel: 3,
        presentationKey: "ember-burst",
        helpText: "cast cinder-snap",
      },
      "hearth-ward": {
        id: "hearth-ward",
        name: "Hearth Ward",
        school: "ember",
        description: "A warm guard.",
        focusCost: 3,
        targetType: "self",
        context: "encounter",
        minLevel: 3,
        presentationKey: "ember-burst",
        helpText: "cast hearth-ward",
      },
    },
  };
}

function runtime(): EngineRuntime {
  let sequence = 0;
  return {
    now: () => new Date("2026-09-17T22:00:00.000Z"),
    nextEventId: () => "evt-spells",
    nextSequence: () => (sequence += 1),
  };
}

describe("spells", () => {
  it("parses grimoire words", () => {
    expect(parsePlayerCommand("spells", "char-rowan")).toEqual({
      verb: "spells",
      characterId: "char-rowan",
    });
    expect(parsePlayerCommand("grimoire", "char-rowan")?.verb).toBe("spells");
  });

  it("lists Ember before the School kit opens", () => {
    const listed = handleSpells(world(), { verb: "spells", characterId: "char-rowan" }, runtime());
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      expect(listed.event.narration).toContain("cast ember");
      expect(listed.event.narration).not.toContain("cinder-snap");
    }
  });

  it("lists the School kit at the third year-mark", () => {
    const state = world();
    state.characters["char-rowan"]!.level = 3;
    const listed = handleSpells(state, { verb: "spells", characterId: "char-rowan" }, runtime());
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      expect(listed.event.narration).toContain("cast ember");
      expect(listed.event.narration).toContain("cast cinder-snap");
      expect(listed.event.narration).toContain("cast hearth-ward");
    }
  });
});
