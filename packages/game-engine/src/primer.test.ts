import { describe, expect, it } from "vitest";
import { handleInk, primerPlayState, unspentInk } from "./primer-book.js";
import { openSchoolLeaf } from "./primer.js";
import { applyRank, canCastSpell, formatGrimoire, formatLeaf, inkStarterKit } from "./primer.js";
import { EXPERIENCE_TO_REACH, MAX_LEVEL, levelForExperience } from "./progression.js";
import type { Character, EngineRuntime, SpellTemplate, WorldState } from "./state.js";

function runtime(random: () => number = () => 0.5): EngineRuntime {
  let sequence = 0;
  let events = 0;
  return {
    now: () => new Date("2026-09-20T20:00:00.000Z"),
    nextEventId: () => `evt-primer-${String((events += 1))}`,
    nextSequence: () => (sequence += 1),
    random,
  };
}

function emberSpell(
  partial: Partial<SpellTemplate> & Pick<SpellTemplate, "id" | "name">,
): SpellTemplate {
  return {
    school: "ember",
    description: "A leaf.",
    focusCost: 4,
    targetType: "enemy",
    context: "encounter",
    presentationKey: "ember-burst",
    helpText: `cast ${partial.id}`,
    ...partial,
  };
}

function primerWorld(): WorldState {
  const spells: Record<string, SpellTemplate> = {
    ember: emberSpell({
      id: "ember",
      name: "Ember",
      damage: 5,
      burningRounds: 2,
      burningDamage: 1,
      tag: "strike",
    }),
    "cinder-snap": emberSpell({
      id: "cinder-snap",
      name: "Cinder Snap",
      focusCost: 3,
      damage: 3,
      effect: "skip-counter",
      tag: "control",
    }),
    "hearth-ward": emberSpell({
      id: "hearth-ward",
      name: "Hearth Ward",
      focusCost: 3,
      targetType: "self",
      effect: "avoid-hit",
      tag: "ward",
    }),
    "flame-breath": emberSpell({
      id: "flame-breath",
      name: "Flame-Breath",
      focusCost: 5,
      damage: 4,
      burningRounds: 1,
      burningDamage: 1,
      tag: "strike",
    }),
    "heart-fire": emberSpell({
      id: "heart-fire",
      name: "Heart-Fire",
      focusCost: 3,
      targetType: "self",
      context: "any",
      effect: "restore-focus",
      restoreFocus: 4,
      tag: "gift",
    }),
    "blaze-mantle": emberSpell({
      id: "blaze-mantle",
      name: "Blaze-Mantle",
      focusCost: 4,
      targetType: "self",
      effect: "avoid-hit",
      tag: "ward",
    }),
    stoke: emberSpell({
      id: "stoke",
      name: "Stoke",
      focusCost: 3,
      targetType: "self",
      effect: "ready-spell",
      readySpellIds: ["ember", "cinder-snap"],
      tag: "gift",
    }),
    briar: emberSpell({
      id: "briar",
      name: "Briar",
      school: "thorn",
      damage: 4,
      tag: "strike",
    }),
  };
  return {
    rooms: {
      "hearth-ember": {
        id: "hearth-ember",
        title: "Hearth of Ember",
        shortDescription: "Coals.",
        longDescription: "A dummy waits.",
        zone: "schools",
        exits: [],
        fixtures: [],
      },
    },
    characters: {
      "char-rowan": {
        id: "char-rowan",
        name: "Rowan",
        roomId: "hearth-ember",
        discoveredRoomIds: ["hearth-ember"],
        schoolId: "ember",
        level: 3,
        experience: 25,
        health: 28,
        maxHealth: 28,
        focus: 14,
        maxFocus: 14,
      },
    },
    spells,
  };
}

describe("Field Primer", () => {
  it("publishes the 1–20 experience table", () => {
    expect(MAX_LEVEL).toBe(20);
    expect(EXPERIENCE_TO_REACH[2]).toBe(10);
    expect(EXPERIENCE_TO_REACH[3]).toBe(25);
    expect(EXPERIENCE_TO_REACH[5]).toBe(70);
    expect(EXPERIENCE_TO_REACH[6]).toBe(100);
    expect(EXPERIENCE_TO_REACH[20]).toBe(1570);
    expect(levelForExperience(10)).toBe(2);
    expect(levelForExperience(25)).toBe(3);
    expect(levelForExperience(69)).toBe(4);
    expect(levelForExperience(70)).toBe(5);
  });

  it("inks the signature stem at rank 1 and shows numbers plus the mentor hand", () => {
    const world = primerWorld();
    const character = world.characters["char-rowan"] as Character;
    inkStarterKit(character);
    expect(character.knownSpells).toEqual([
      { spellId: "ember", rank: 1, pennedBy: "Mentor Cinder" },
    ]);
    const book = formatGrimoire(world, character);
    expect(book).toContain("Ember · I");
    expect(book).toContain("Rank 1. Focus 4. Damage 5. Burns 2.");
    expect(book).toContain("Penned by Mentor Cinder");
    expect(book).toContain("Flame-Breath · — (foxed blank)");
    const leaf = formatLeaf(world, character, world.spells!.ember);
    expect(leaf).toContain("Ember · I");
    expect(leaf).toContain("cast ember");
    expect(canCastSpell(character, world.spells!["cinder-snap"]!)).toBe(false);
    expect(canCastSpell({ ...character, knownSpells: [] }, world.spells!["cinder-snap"]!)).toBe(
      false,
    );
    expect(canCastSpell({ ...character, knownSpells: [] }, world.spells!.ember)).toBe(true);
  });

  it("raises authored ranks and cannot spend twenty ink on every leaf", () => {
    const ranked = applyRank(
      emberSpell({
        id: "ember",
        name: "Ember",
        damage: 5,
        ranks: [
          { focusCost: 4, damage: 5, burningRounds: 2 },
          { focusCost: 4, damage: 6, burningRounds: 2 },
          { focusCost: 3, damage: 6, burningRounds: 2 },
          { focusCost: 3, damage: 7, burningRounds: 2, marginNote: "deeper" },
          { focusCost: 3, damage: 8, burningRounds: 3 },
        ],
      }),
      5,
    );
    expect(ranked).toMatchObject({ focusCost: 3, damage: 8, burningRounds: 3 });
    expect(17).toBeLessThan(7 * 5);
  });

  it("refuses a locked tip, opens an OR rejoin from either parent, and requires both parents for an AND tip", () => {
    const world = primerWorld();
    const character = world.characters["char-rowan"] as Character;
    inkStarterKit(character);
    character.primerAwardedLevels = [4, 5, 6, 7];
    const clock = runtime();
    const locked = handleInk(
      world,
      { verb: "ink", characterId: "char-rowan", target: "blaze-mantle" },
      clock,
    );
    expect(locked).toMatchObject({ ok: false, message: "That node is still shut." });
    const snap = handleInk(
      world,
      { verb: "ink", characterId: "char-rowan", target: "cinder snap" },
      clock,
    );
    expect(snap.ok).toBe(true);
    const stoke = handleInk(
      world,
      { verb: "ink", characterId: "char-rowan", target: "stoke" },
      clock,
    );
    expect(stoke.ok).toBe(true);
    const mantle = handleInk(
      world,
      { verb: "ink", characterId: "char-rowan", target: "blaze-mantle" },
      clock,
    );
    expect(mantle).toMatchObject({ ok: false, message: "That node is still shut." });
    handleInk(world, { verb: "ink", characterId: "char-rowan", target: "hearth ward" }, clock);
    handleInk(world, { verb: "ink", characterId: "char-rowan", target: "flame-breath" }, clock);
    expect(unspentInk(character)).toBe(0);
    character.primerAwardedLevels = [4, 5, 6, 7, 8];
    const opened = handleInk(
      world,
      { verb: "ink", characterId: "char-rowan", target: "blaze-mantle" },
      clock,
    );
    expect(opened.ok).toBe(true);
    const book = primerPlayState(world, character);
    const ember = book?.leaves.find((leaf) => leaf.schoolId === "ember");
    expect(ember?.nodes.find((node) => node.id === "blaze-mantle")?.status).toBe("inked");
    expect(ember?.nodes.find((node) => node.id === "stoke")?.status).toBe("inked");
  });

  it("adds a second school leaf without changing the home school", () => {
    const world = primerWorld();
    const character = world.characters["char-rowan"] as Character;
    character.schoolId = "ember";
    inkStarterKit(character);
    openSchoolLeaf(character, "thorn");
    expect(character.schoolId).toBe("ember");
    expect(character.knownSpells?.map((leaf) => leaf.spellId)).toEqual(["ember", "briar"]);
    const book = primerPlayState(world, character);
    expect(book?.leaves.find((leaf) => leaf.schoolId === "thorn")?.open).toBe(true);
    expect(book?.leaves.find((leaf) => leaf.schoolId === "veil")?.open).toBe(false);
  });
});
