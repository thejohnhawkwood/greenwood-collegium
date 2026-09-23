import { signatureSpellId } from "./leaf-graphs.js";
import type {
  Character,
  KnownSpellLeaf,
  SchoolId,
  SpellRankNumbers,
  SpellTemplate,
  WorldState,
} from "./state.js";

const SCHOOL_IDS = ["ember", "thorn", "veil", "stars", "stone", "steel"] as const;

function isSchoolId(value: string | undefined): value is SchoolId {
  return Boolean(value && (SCHOOL_IDS as readonly string[]).includes(value));
}

const SCHOOL_TITLE: Record<SchoolId, string> = {
  ember: "Ember",
  thorn: "Thorns",
  veil: "the Veil",
  stars: "Stars",
  stone: "Stone",
  steel: "Steel",
};

export const SCHOOL_LEAVES: Record<SchoolId, readonly string[]> = {
  ember: [
    "ember",
    "cinder-snap",
    "hearth-ward",
    "flame-breath",
    "heart-fire",
    "blaze-mantle",
    "stoke",
  ],
  thorn: ["briar", "bind", "greenstitch", "prune", "thornwall", "sap", "ask-first"],
  veil: ["shade", "slip", "quiet-step", "after-image", "hush", "pale", "unname"],
  stars: ["azimuth", "flare", "night-eye", "transit", "wane", "chart", "true-north"],
  stone: ["keystone", "stomp", "brace", "quarry", "lintel", "stillness", "buttress"],
  steel: ["strike", "riposte", "ready-steel", "guard-break", "draw", "second-wind", "oath-edge"],
};

export const SCHOOL_MENTOR_PEN: Record<SchoolId, string> = {
  ember: "Mentor Cinder",
  thorn: "Mentor Briar",
  veil: "Mentor Mist",
  stars: "Mentor Lumen",
  stone: "Mentor Quern",
  steel: "Mentor Edge",
};

const ROMAN = ["I", "II", "III", "IV", "V"] as const;

export function mentorPenName(schoolId: SchoolId | undefined): string {
  return schoolId ? SCHOOL_MENTOR_PEN[schoolId] : "a hearth mentor";
}

export function knownLeaves(character: Character): KnownSpellLeaf[] {
  return [...(character.knownSpells ?? [])];
}

export function findKnownSpell(character: Character, spellId: string): KnownSpellLeaf | undefined {
  return character.knownSpells?.find((leaf) => leaf.spellId === spellId);
}

export function canCastSpell(character: Character, spell: SpellTemplate): boolean {
  if (spell.id === "ember") {
    return true;
  }
  return Boolean(findKnownSpell(character, spell.id));
}

export function defaultRankTable(spell: SpellTemplate): SpellRankNumbers[] {
  const r1: SpellRankNumbers = {
    focusCost: spell.focusCost,
    damage: spell.damage,
    heal: spell.heal,
    burningRounds: spell.burningRounds,
    burningDamage: spell.burningDamage,
    restoreFocus: spell.restoreFocus,
    insight: spell.insight,
  };
  const r2: SpellRankNumbers = { ...r1 };
  if (r2.damage !== undefined) {
    r2.damage += 1;
  } else if (r2.heal !== undefined) {
    r2.heal += 1;
  } else if (r2.burningRounds !== undefined) {
    r2.burningRounds += 1;
  } else if (r2.restoreFocus !== undefined) {
    r2.restoreFocus += 1;
  }
  const r3: SpellRankNumbers = { ...r2 };
  if ((r3.focusCost ?? 0) > 1) {
    r3.focusCost = (r3.focusCost ?? 1) - 1;
  } else if (r3.damage !== undefined) {
    r3.damage += 1;
  }
  const r4: SpellRankNumbers = { ...r3, marginNote: "The margin deepens in the same hand." };
  if (r4.damage !== undefined) {
    r4.damage += 1;
  } else if (r4.heal !== undefined) {
    r4.heal += 1;
  } else if (r4.restoreFocus !== undefined) {
    r4.restoreFocus += 1;
  }
  const r5: SpellRankNumbers = {
    ...r4,
    marginNote: "A last sentence sits in the mentor's hand.",
  };
  if (r5.damage !== undefined) {
    r5.damage += 1;
  } else if (r5.heal !== undefined) {
    r5.heal += 1;
  } else if (r5.burningRounds !== undefined) {
    r5.burningRounds += 1;
  }
  return [r1, r2, r3, r4, r5];
}

export function applyRank(spell: SpellTemplate, rank: number): SpellTemplate {
  const safe = Math.max(1, Math.min(5, Math.floor(rank)));
  const table = spell.ranks && spell.ranks.length >= safe ? spell.ranks : defaultRankTable(spell);
  const numbers = table[safe - 1] ?? {};
  return {
    ...spell,
    focusCost: numbers.focusCost ?? spell.focusCost,
    damage: numbers.damage ?? spell.damage,
    heal: numbers.heal ?? spell.heal,
    burningRounds: numbers.burningRounds ?? spell.burningRounds,
    burningDamage: numbers.burningDamage ?? spell.burningDamage,
    restoreFocus: numbers.restoreFocus ?? spell.restoreFocus,
    insight: numbers.insight ?? spell.insight,
  };
}

export function rankedKnownSpell(
  world: WorldState,
  character: Character,
  spellId: string,
): SpellTemplate | undefined {
  const spell = world.spells?.[spellId];
  if (!spell) {
    return undefined;
  }
  const leaf = findKnownSpell(character, spellId);
  if (!leaf && spell.id !== "ember") {
    return undefined;
  }
  return applyRank(spell, leaf?.rank ?? 1);
}

export function inkedSpellTemplates(world: WorldState, character: Character): SpellTemplate[] {
  const listed: SpellTemplate[] = [];
  const seen = new Set<string>();
  for (const leaf of knownLeaves(character)) {
    const ranked = rankedKnownSpell(world, character, leaf.spellId);
    if (!ranked || seen.has(ranked.id)) {
      continue;
    }
    seen.add(ranked.id);
    listed.push(ranked);
  }
  return listed;
}

export function openSchoolLeaf(
  character: Character,
  schoolId: SchoolId,
): KnownSpellLeaf | undefined {
  const spellId = signatureSpellId(schoolId);
  if (!spellId) {
    return undefined;
  }
  const known = knownLeaves(character);
  const existing = known.find((leaf) => leaf.spellId === spellId);
  if (existing) {
    return existing;
  }
  const inked = { spellId, rank: 1, pennedBy: SCHOOL_MENTOR_PEN[schoolId] };
  character.knownSpells = [...known, inked];
  return inked;
}

/** Home-school intro. Inks only the signature stem. */
export function inkStarterKit(character: Character): KnownSpellLeaf[] {
  if (!character.schoolId) {
    return knownLeaves(character);
  }
  openSchoolLeaf(character, character.schoolId);
  return knownLeaves(character);
}

export function markPrimerAwarded(character: Character, level: number): void {
  const awarded = new Set(character.primerAwardedLevels ?? []);
  awarded.add(level);
  character.primerAwardedLevels = [...awarded].sort((left, right) => left - right);
}

export function primerAwarded(character: Character, level: number): boolean {
  return Boolean(character.primerAwardedLevels?.includes(level));
}

function romanRank(rank: number | undefined): string {
  if (!rank) {
    return "—";
  }
  return ROMAN[rank - 1] ?? String(rank);
}

function numberLine(spell: SpellTemplate): string {
  const bits = [
    `Focus ${String(spell.focusCost)}`,
    spell.damage !== undefined ? `Damage ${String(spell.damage)}` : undefined,
    spell.heal !== undefined ? `Heal ${String(spell.heal)}` : undefined,
    spell.restoreFocus !== undefined ? `Restore ${String(spell.restoreFocus)} focus` : undefined,
    spell.burningRounds !== undefined ? `Burns ${String(spell.burningRounds)}` : undefined,
    spell.effect === "avoid-hit" || spell.effect === "halve-hit"
      ? spell.effect === "halve-hit"
        ? "Halves the next blow"
        : "Turns the next blow aside"
      : undefined,
    spell.effect === "skip-counter" ? "The foe cannot answer" : undefined,
    spell.effect === "weaken" ? "The foe's next blow is weaker" : undefined,
    spell.effect === "brace" ? "Hold more of the lesson" : undefined,
  ].filter((bit): bit is string => Boolean(bit));
  return bits.join(". ") + ".";
}

export function formatLeaf(world: WorldState, character: Character, spell: SpellTemplate): string {
  const leaf = findKnownSpell(character, spell.id);
  const school = isSchoolId(spell.school) ? SCHOOL_TITLE[spell.school] : spell.school;
  const ranked = leaf ? applyRank(spell, leaf.rank) : spell;
  const penned =
    leaf?.pennedBy ??
    spell.pennedBy ??
    mentorPenName(isSchoolId(spell.school) ? spell.school : character.schoolId);
  const table =
    spell.ranks && spell.ranks.length >= (leaf?.rank ?? 1) ? spell.ranks : defaultRankTable(spell);
  const margin = leaf ? table[leaf.rank - 1]?.marginNote : undefined;
  if (!leaf && spell.id !== "ember") {
    return [
      `${spell.name} · — (foxed blank)`,
      `School: ${school}`,
      "This leaf is not yet inked.",
      `Penned by ${penned} when you earn it.`,
    ].join("\n");
  }
  const rank = leaf?.rank ?? 1;
  return [
    `${ranked.name} · ${romanRank(rank)}`,
    `School: ${school}`,
    `Rank ${String(rank)}. ${numberLine(ranked)}`,
    ranked.description,
    `Penned by ${penned}.${margin ? ` ${margin}` : ""}`,
    ranked.helpText,
  ].join("\n");
}

export function formatGrimoire(world: WorldState, character: Character): string {
  if (!character.schoolId) {
    return [
      "Your Field Primer is still foxed.",
      "Talk Alder to choose a School. Ember waits in the orchard as Flint's practice spark. Type cast ember.",
    ].join("\n");
  }
  const school = character.schoolId;
  const lines = [`Your Field Primer. School of ${SCHOOL_TITLE[school]}.`];
  for (const spellId of SCHOOL_LEAVES[school]) {
    const spell = world.spells?.[spellId];
    if (!spell) {
      continue;
    }
    const leaf = findKnownSpell(character, spellId);
    if (!leaf) {
      lines.push(`  ${spell.name} · — (foxed blank)`);
      continue;
    }
    const ranked = applyRank(spell, leaf.rank);
    lines.push(`  ${ranked.name} · ${romanRank(leaf.rank)}`);
    lines.push(`    Rank ${String(leaf.rank)}. ${numberLine(ranked)}`);
    lines.push(`    ${ranked.description}`);
    lines.push(`    Penned by ${leaf.pennedBy}.`);
  }
  const extras = knownLeaves(character).filter(
    (leaf) => !SCHOOL_LEAVES[school].includes(leaf.spellId),
  );
  for (const leaf of extras) {
    const spell = world.spells?.[leaf.spellId];
    if (!spell) {
      continue;
    }
    const ranked = applyRank(spell, leaf.rank);
    lines.push(`  ${ranked.name} · ${romanRank(leaf.rank)}`);
    lines.push(`    Rank ${String(leaf.rank)}. ${numberLine(ranked)}`);
    lines.push(`    Penned by ${leaf.pennedBy}.`);
  }
  if (!findKnownSpell(character, "ember") && school !== "ember") {
    lines.push("Orchard practice: Ember remains Flint's spark. Type cast ember.");
  }
  lines.push("Open the Primer to choose a vein. Type ink and the leaf's name.");
  return lines.join("\n");
}

export function matchPrimerLeaf(
  world: WorldState,
  character: Character,
  raw: string,
): SpellTemplate | undefined {
  const needle = raw.trim().toLowerCase();
  if (!needle) {
    return undefined;
  }
  const candidates = [
    ...(character.schoolId
      ? SCHOOL_LEAVES[character.schoolId].flatMap((id) => {
          const spell = world.spells?.[id];
          return spell ? [spell] : [];
        })
      : []),
    ...inkedSpellTemplates(world, character),
    world.spells?.ember,
  ].filter((spell): spell is SpellTemplate => Boolean(spell));
  return candidates.find(
    (spell) =>
      spell.id === needle ||
      spell.name.toLowerCase() === needle ||
      spell.name.toLowerCase().includes(needle),
  );
}
