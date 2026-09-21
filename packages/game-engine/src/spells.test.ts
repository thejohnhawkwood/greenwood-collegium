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
    expect(parsePlayerCommand("spells ember", "char-rowan")).toEqual({
      verb: "spells",
      characterId: "char-rowan",
      target: "ember",
    });
  });

  it("lists foxed Ember pages before any leaf is inked", () => {
    const listed = handleSpells(world(), { verb: "spells", characterId: "char-rowan" }, runtime());
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      expect(listed.event.narration).toContain("Field Primer");
      expect(listed.event.narration).toContain("foxed blank");
      expect(listed.event.narration).not.toContain("Ember · I");
    }
  });

  it("lists inked leaves with ranks after first lessons", () => {
    const state = world();
    state.characters["char-rowan"]!.knownSpells = [
      { spellId: "ember", rank: 1, pennedBy: "Mentor Cinder" },
      { spellId: "cinder-snap", rank: 1, pennedBy: "Mentor Cinder" },
      { spellId: "hearth-ward", rank: 1, pennedBy: "Mentor Cinder" },
    ];
    const listed = handleSpells(state, { verb: "spells", characterId: "char-rowan" }, runtime());
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      expect(listed.event.narration).toContain("Ember · I");
      expect(listed.event.narration).toContain("Cinder Snap · I");
      expect(listed.event.narration).toContain("Hearth Ward · I");
      expect(listed.event.narration).toContain("Penned by Mentor Cinder");
    }
    const leaf = handleSpells(
      state,
      { verb: "spells", characterId: "char-rowan", target: "ember" },
      runtime(),
    );
    expect(leaf.ok && leaf.event.narration).toContain("Rank 1.");
  });
});
