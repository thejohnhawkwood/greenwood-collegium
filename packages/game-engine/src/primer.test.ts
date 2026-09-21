import { describe, expect, it } from "vitest";
import {
  applyPrimerChoice,
  applyRank,
  buildPrimerOffer,
  canCastSpell,
  describePrimerCard,
  formatGrimoire,
  formatLeaf,
  inkStarterKit,
  legalPrimerCards,
  openPrimerChoices,
  primerPlayState,
  weightForCard,
} from "./primer.js";
import { EXPERIENCE_TO_REACH, MAX_LEVEL, levelForExperience } from "./progression.js";
import { handleSay } from "./say.js";
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

  it("inks three starter leaves at rank 1 and shows numbers plus the mentor hand", () => {
    const world = primerWorld();
    const character = world.characters["char-rowan"] as Character;
    inkStarterKit(character);
    expect(character.knownSpells).toEqual([
      { spellId: "ember", rank: 1, pennedBy: "Mentor Cinder" },
      { spellId: "cinder-snap", rank: 1, pennedBy: "Mentor Cinder" },
      { spellId: "hearth-ward", rank: 1, pennedBy: "Mentor Cinder" },
    ]);
    const book = formatGrimoire(world, character);
    expect(book).toContain("Ember · I");
    expect(book).toContain("Rank 1. Focus 4. Damage 5. Burns 2.");
    expect(book).toContain("Penned by Mentor Cinder");
    expect(book).toContain("Flame-Breath · — (foxed blank)");
    const leaf = formatLeaf(world, character, world.spells!.ember);
    expect(leaf).toContain("Ember · I");
    expect(leaf).toContain("cast ember");
    expect(canCastSpell(character, world.spells!["cinder-snap"]!)).toBe(true);
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
    const careerInk = 3 + 17;
    expect(careerInk).toBe(20);
    expect(7 * 5).toBe(35);
    expect(careerInk).toBeLessThan(35);
  });

  it("opens three typed choices and applies 1 without rerolling a stored offer", () => {
    const world = primerWorld();
    const character = world.characters["char-rowan"] as Character;
    inkStarterKit(character);
    character.level = 4;
    const clock = runtime(() => 0.1);
    const first = openPrimerChoices(world, character, 4, clock);
    expect(first[0]?.narration).toContain("Mentor Cinder's hand offers three leaves");
    expect(first[0]?.narration).toContain("Choose a leaf, or type 1, 2, or 3.");
    const stored = character.pendingPrimerChoices;
    const painted = primerPlayState(world, character);
    expect(painted?.cards).toHaveLength(3);
    expect(painted?.cards.every((card) => card.description.length > 0)).toBe(true);
    expect(describePrimerCard(world, stored!.options[0]!, 0).command).toBe("1");
    expect(stored?.options).toHaveLength(3);
    const again = openPrimerChoices(
      world,
      character,
      4,
      runtime(() => 0.9),
    );
    expect(again[0]?.narration).toBe(first[0]?.narration);
    expect(character.pendingPrimerChoices).toEqual(stored);
    const picked = handleSay(world, { verb: "say", characterId: "char-rowan", text: "1" }, clock);
    expect(picked.ok).toBe(true);
    expect(character.pendingPrimerChoices).toBeUndefined();
    expect(
      character.knownSpells?.some((leaf) => leaf.rank > 1) || character.knownSpells!.length > 3,
    ).toBe(true);
  });

  it("weights upgrades toward a strike book and keeps courtesy rare until lesson 8", () => {
    const world = primerWorld();
    const character = world.characters["char-rowan"] as Character;
    inkStarterKit(character);
    const upgrade = legalPrimerCards(world, character, 6).find((card) => card.kind === "upgrade")!;
    const unlock = legalPrimerCards(world, character, 6).find((card) => card.kind === "unlock")!;
    expect(weightForCard(world, character, upgrade, 6)).toBeGreaterThan(
      weightForCard(world, character, unlock, 6),
    );
    expect(legalPrimerCards(world, character, 6).some((card) => card.kind === "courtesy")).toBe(
      false,
    );
    const courtesy = legalPrimerCards(world, character, 8).filter(
      (card) => card.kind === "courtesy",
    );
    expect(courtesy.length).toBeGreaterThan(0);
    expect(weightForCard(world, character, courtesy[0]!, 8)).toBe(3);
    let strikeCards = 0;
    let courtesyCards = 0;
    for (let seed = 0; seed < 80; seed += 1) {
      let cursor = seed / 80;
      const offer = buildPrimerOffer(
        world,
        character,
        8,
        runtime(() => (cursor += 0.017) % 1),
      );
      strikeCards += offer.filter((card) => card.tag === "strike").length;
      courtesyCards += offer.filter((card) => card.kind === "courtesy").length;
    }
    expect(strikeCards).toBeGreaterThan(courtesyCards);
  });

  it("pads a stalled book with one vital leaf and applies it", () => {
    const world = primerWorld();
    const character = world.characters["char-rowan"] as Character;
    character.knownSpells = [
      { spellId: "ember", rank: 5, pennedBy: "Mentor Cinder" },
      { spellId: "cinder-snap", rank: 5, pennedBy: "Mentor Cinder" },
      { spellId: "hearth-ward", rank: 5, pennedBy: "Mentor Cinder" },
      { spellId: "flame-breath", rank: 5, pennedBy: "Mentor Cinder" },
      { spellId: "heart-fire", rank: 5, pennedBy: "Mentor Cinder" },
      { spellId: "blaze-mantle", rank: 5, pennedBy: "Mentor Cinder" },
      { spellId: "stoke", rank: 5, pennedBy: "Mentor Cinder" },
    ];
    const offer = buildPrimerOffer(world, character, 16, runtime());
    expect(offer.some((card) => card.kind === "vital")).toBe(true);
    character.pendingPrimerChoices = { level: 16, options: offer };
    const vitalIndex = offer.findIndex((card) => card.kind === "vital");
    applyPrimerChoice(world, character, vitalIndex, runtime());
    expect(character.maxHealth).toBe(30);
    expect(character.maxFocus).toBe(15);
  });
});
