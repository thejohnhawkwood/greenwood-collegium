import type { EventEnvelope } from "@greenwood/contracts";
import type {
  Character,
  EngineRuntime,
  KnownSpellLeaf,
  PendingPrimerChoices,
  PrimerChoiceCard,
  PrimerChoiceKind,
  SchoolId,
  SpellRankNumbers,
  SpellTag,
  SpellTemplate,
  WorldState,
} from "./state.js";
import { systemNotice } from "./system-notice.js";

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

export const SCHOOL_NEIGHBORS: Record<SchoolId, readonly SchoolId[]> = {
  ember: ["thorn", "veil", "stone"],
  thorn: ["ember", "veil", "steel", "stars"],
  veil: ["ember", "thorn", "stone"],
  stars: ["thorn", "steel"],
  stone: ["ember", "veil"],
  steel: ["thorn", "stars"],
};

const ROMAN = ["I", "II", "III", "IV", "V"] as const;
const VITAL_HEALTH = 2;
const VITAL_FOCUS = 1;

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

export function inkStarterKit(character: Character): KnownSpellLeaf[] {
  if (!character.schoolId) {
    return knownLeaves(character);
  }
  const pennedBy = SCHOOL_MENTOR_PEN[character.schoolId];
  const known = knownLeaves(character);
  for (const spellId of SCHOOL_LEAVES[character.schoolId].slice(0, 3)) {
    if (!known.some((leaf) => leaf.spellId === spellId)) {
      known.push({ spellId, rank: 1, pennedBy });
    }
  }
  character.knownSpells = known;
  markPrimerAwarded(character, 3);
  return known;
}

export function markPrimerAwarded(character: Character, level: number): void {
  const awarded = new Set(character.primerAwardedLevels ?? []);
  awarded.add(level);
  character.primerAwardedLevels = [...awarded].sort((left, right) => left - right);
}

export function primerAwarded(character: Character, level: number): boolean {
  return Boolean(character.primerAwardedLevels?.includes(level));
}

function spellTag(spell: SpellTemplate | undefined): SpellTag {
  return spell?.tag ?? inferTag(spell);
}

function inferTag(spell: SpellTemplate | undefined): SpellTag {
  if (!spell) {
    return "strike";
  }
  if (spell.effect === "heal" || spell.effect === "restore-focus" || spell.effect === "insight") {
    return "gift";
  }
  if (
    spell.effect === "avoid-hit" ||
    spell.effect === "brace" ||
    spell.effect === "halve-hit" ||
    spell.id.includes("ward")
  ) {
    return "ward";
  }
  if (spell.effect === "skip-counter" || spell.effect === "riposte" || spell.effect === "weaken") {
    return "control";
  }
  return "strike";
}

function roll(runtime: EngineRuntime): number {
  return runtime.random?.() ?? Math.random();
}

function pickWeighted<T>(entries: ReadonlyArray<{ item: T; weight: number }>, random: number): T {
  const total = entries.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
  if (total <= 0) {
    return entries[entries.length - 1]!.item;
  }
  let cursor = random * total;
  for (const entry of entries) {
    cursor -= Math.max(0, entry.weight);
    if (cursor <= 0) {
      return entry.item;
    }
  }
  return entries[entries.length - 1]!.item;
}

function ownedInSchool(character: Character, schoolId: SchoolId): number {
  const leaves = new Set(SCHOOL_LEAVES[schoolId]);
  return knownLeaves(character).filter((leaf) => leaves.has(leaf.spellId)).length;
}

function ownedWithTag(world: WorldState, character: Character, tag: SpellTag): number {
  return knownLeaves(character).filter((leaf) => spellTag(world.spells?.[leaf.spellId]) === tag)
    .length;
}

function cardKey(card: PrimerChoiceCard): string {
  if (card.kind === "vital") {
    return "vital";
  }
  return `${card.kind}:${card.spellId ?? ""}`;
}

export function weightForCard(
  world: WorldState,
  character: Character,
  card: PrimerChoiceCard,
  offerLevel: number,
): number {
  if (card.kind === "vital") {
    return 1;
  }
  if (card.kind === "courtesy") {
    return 3;
  }
  const schoolId = character.schoolId;
  const inSchool = schoolId ? ownedInSchool(character, schoolId) : 0;
  const tag = card.tag ?? "strike";
  const tagOverlap = ownedWithTag(world, character, tag);
  if (card.kind === "upgrade") {
    let weight = 10 + 4 * tagOverlap + 2 * inSchool;
    if (inSchool >= 5) {
      weight *= 1.3;
    }
    return weight;
  }
  let weight = 8 + (inSchool < 4 ? 4 : 0) + 3 * tagOverlap;
  if (inSchool >= 5) {
    weight *= 0.6;
  }
  if (offerLevel === 4 || offerLevel === 5) {
    weight *= 0.5;
  }
  return weight;
}

export function legalPrimerCards(
  world: WorldState,
  character: Character,
  offerLevel: number,
): PrimerChoiceCard[] {
  const cards: PrimerChoiceCard[] = [];
  const known = new Set(knownLeaves(character).map((leaf) => leaf.spellId));
  for (const leaf of knownLeaves(character)) {
    if (leaf.rank >= 5) {
      continue;
    }
    const spell = world.spells?.[leaf.spellId];
    if (!spell) {
      continue;
    }
    cards.push({
      kind: "upgrade",
      spellId: spell.id,
      rank: leaf.rank + 1,
      schoolId: isSchoolId(spell.school) ? spell.school : character.schoolId,
      tag: spellTag(spell),
    });
  }
  if (character.schoolId) {
    for (const spellId of SCHOOL_LEAVES[character.schoolId]) {
      if (known.has(spellId)) {
        continue;
      }
      const spell = world.spells?.[spellId];
      if (!spell) {
        continue;
      }
      cards.push({
        kind: "unlock",
        spellId: spell.id,
        rank: 1,
        schoolId: character.schoolId,
        tag: spellTag(spell),
      });
    }
  }
  if (offerLevel >= 8 && character.schoolId) {
    for (const neighbor of SCHOOL_NEIGHBORS[character.schoolId]) {
      for (const spellId of SCHOOL_LEAVES[neighbor].slice(0, 3)) {
        if (known.has(spellId)) {
          continue;
        }
        const spell = world.spells?.[spellId];
        if (!spell) {
          continue;
        }
        cards.push({
          kind: "courtesy",
          spellId: spell.id,
          rank: 1,
          schoolId: neighbor,
          tag: spellTag(spell),
        });
      }
    }
  }
  return cards;
}

export function buildPrimerOffer(
  world: WorldState,
  character: Character,
  offerLevel: number,
  runtime: EngineRuntime,
): PrimerChoiceCard[] {
  const pool = legalPrimerCards(world, character, offerLevel);
  const picked: PrimerChoiceCard[] = [];
  const remaining = [...pool];
  while (picked.length < 3 && remaining.length > 0) {
    const weighted = remaining.map((item) => ({
      item,
      weight: weightForCard(world, character, item, offerLevel),
    }));
    const choice = pickWeighted(weighted, roll(runtime));
    picked.push(choice);
    const key = cardKey(choice);
    for (let index = remaining.length - 1; index >= 0; index -= 1) {
      if (cardKey(remaining[index]!) === key) {
        remaining.splice(index, 1);
      }
    }
  }
  const startersMaxed =
    Boolean(character.schoolId) &&
    SCHOOL_LEAVES[character.schoolId!]
      .slice(0, 3)
      .every((id) => findKnownSpell(character, id)?.rank === 5);
  if (startersMaxed && !picked.some((card) => card.kind === "unlock")) {
    const unlock = pool.find((card) => card.kind === "unlock");
    if (unlock) {
      picked[picked.length - 1] = unlock;
    }
  }
  if (picked.length < 3) {
    picked.push({
      kind: "vital",
      vitalHealth: VITAL_HEALTH,
      vitalFocus: VITAL_FOCUS,
    });
  }
  return picked.slice(0, 3);
}

const PRIMER_COMMANDS = ["1", "2", "3"] as const;

export function describePrimerCard(
  world: WorldState,
  card: PrimerChoiceCard,
  index: number,
): {
  command: (typeof PRIMER_COMMANDS)[number];
  title: string;
  badge: string;
  kind: PrimerChoiceKind;
  numbers: string;
  description: string;
  pennedBy?: string;
} {
  const command = PRIMER_COMMANDS[index] ?? "1";
  if (card.kind === "vital") {
    const health = card.vitalHealth ?? VITAL_HEALTH;
    const focus = card.vitalFocus ?? VITAL_FOCUS;
    return {
      command,
      title: "Vital leaf",
      badge: "Vital",
      kind: "vital",
      numbers: `+${String(health)} health. +${String(focus)} focus.`,
      description: "A thicker page. Your health and focus rise so the next field is kinder.",
    };
  }
  const spell = card.spellId ? world.spells?.[card.spellId] : undefined;
  const rank = card.rank ?? 1;
  const ranked = spell ? applyRank(spell, rank) : undefined;
  const badge =
    card.kind === "upgrade"
      ? `Rank ${romanRank(rank)}`
      : card.kind === "courtesy"
        ? "Courtesy"
        : "New";
  return {
    command,
    title: spell?.name ?? card.spellId ?? "Leaf",
    badge,
    kind: card.kind,
    numbers: ranked ? numberLine(ranked) : "The numbers wait on the page.",
    description: spell?.description ?? "A leaf waits in the Primer.",
    ...(spell?.pennedBy ? { pennedBy: spell.pennedBy } : {}),
  };
}

export function primerPlayState(world: WorldState, character: Character) {
  const pending = character.pendingPrimerChoices;
  if (!pending?.options.length) {
    return undefined;
  }
  const pennedBy = mentorPenName(character.schoolId);
  return {
    pennedBy,
    prompt: `${pennedBy}'s hand offers three leaves.`,
    cards: pending.options.slice(0, 3).map((card, index) => describePrimerCard(world, card, index)),
  };
}

function formatCardLine(world: WorldState, card: PrimerChoiceCard, index: number): string {
  const view = describePrimerCard(world, card, index - 1);
  if (view.kind === "vital") {
    return `  ${view.command}. ${view.title} — ${view.numbers}`;
  }
  const kindBit =
    card.kind === "upgrade"
      ? `rank ${String(card.rank ?? 1)}`
      : card.kind === "courtesy"
        ? "courtesy"
        : "new";
  return `  ${view.command}. ${view.title} — ${kindBit}. ${view.numbers}`;
}

export function formatPrimerOffer(
  world: WorldState,
  character: Character,
  pending: PendingPrimerChoices,
): string {
  const mentor = mentorPenName(character.schoolId);
  const lines = pending.options.map((card, index) => formatCardLine(world, card, index + 1));
  return [
    `${mentor}'s hand offers three leaves:`,
    ...lines,
    "Choose a leaf, or type 1, 2, or 3.",
  ].join("\n");
}

export function openPrimerChoices(
  world: WorldState,
  character: Character,
  offerLevel: number,
  runtime: EngineRuntime,
  commandId?: string,
): EventEnvelope[] {
  if (character.pendingPrimerChoices?.options.length) {
    character.openConversation = undefined;
    return [
      systemNotice(
        character.id,
        formatPrimerOffer(world, character, character.pendingPrimerChoices),
        runtime,
      ),
    ];
  }
  if (primerAwarded(character, offerLevel) && !character.pendingPrimerChoices) {
    return [];
  }
  const options = buildPrimerOffer(world, character, offerLevel, runtime);
  if (options.length === 0) {
    return [];
  }
  character.pendingPrimerChoices = { level: offerLevel, options, commandId };
  markPrimerAwarded(character, offerLevel);
  character.openConversation = undefined;
  return [
    systemNotice(
      character.id,
      formatPrimerOffer(world, character, character.pendingPrimerChoices),
      runtime,
    ),
  ];
}

export function maybeOpenWorldPrimer(
  world: WorldState,
  character: Character,
  previousLevel: number,
  nextLevel: number,
  runtime: EngineRuntime,
): EventEnvelope[] {
  if (character.pendingPrimerChoices?.options.length) {
    return [];
  }
  for (let level = Math.max(6, previousLevel + 1); level <= nextLevel; level += 1) {
    if (!primerAwarded(character, level)) {
      return openPrimerChoices(world, character, level, runtime);
    }
  }
  return [];
}

function applyVital(character: Character, card: PrimerChoiceCard): string {
  const health = card.vitalHealth ?? VITAL_HEALTH;
  const focus = card.vitalFocus ?? VITAL_FOCUS;
  character.maxHealth = (character.maxHealth ?? 20) + health;
  character.maxFocus = (character.maxFocus ?? 10) + focus;
  character.health = Math.min(
    character.maxHealth,
    (character.health ?? character.maxHealth) + health,
  );
  character.focus = Math.min(character.maxFocus, (character.focus ?? character.maxFocus) + focus);
  return `A vital leaf. Health +${String(health)}, focus +${String(focus)}.`;
}

function applyInk(character: Character, card: PrimerChoiceCard, world: WorldState): string {
  const spellId = card.spellId;
  if (!spellId) {
    return "The page stays foxed.";
  }
  const spell = world.spells?.[spellId];
  const pennedBy = card.schoolId
    ? SCHOOL_MENTOR_PEN[card.schoolId]
    : mentorPenName(character.schoolId);
  const existing = findKnownSpell(character, spellId);
  const nextRank = card.rank ?? (existing ? existing.rank + 1 : 1);
  if (existing) {
    existing.rank = Math.min(5, nextRank);
  } else {
    character.knownSpells = [
      ...knownLeaves(character),
      { spellId, rank: Math.min(5, nextRank), pennedBy },
    ];
  }
  const name = spell?.name ?? spellId;
  if (card.kind === "upgrade") {
    return `${pennedBy} raises ${name} to rank ${String(Math.min(5, nextRank))}.`;
  }
  return `${pennedBy} inks ${name} at rank 1.`;
}

export function applyPrimerChoice(
  world: WorldState,
  character: Character,
  index: number,
  runtime: EngineRuntime,
): EventEnvelope[] {
  const pending = character.pendingPrimerChoices;
  const card = pending?.options[index];
  if (!pending || !card) {
    return [];
  }
  const note =
    card.kind === "vital" ? applyVital(character, card) : applyInk(character, card, world);
  character.pendingPrimerChoices = undefined;
  const events = [systemNotice(character.id, note, runtime)];
  events.push(
    ...maybeOpenWorldPrimer(
      world,
      character,
      pending.level,
      character.level ?? pending.level,
      runtime,
    ),
  );
  return events;
}

export function applyPrimerChoiceIfPending(
  world: WorldState,
  character: Character,
  text: string,
  runtime: EngineRuntime,
): EventEnvelope[] | undefined {
  if (!character.pendingPrimerChoices?.options.length || character.openConversation) {
    return undefined;
  }
  const trimmed = text.trim();
  if (!/^[123]$/u.test(trimmed)) {
    return undefined;
  }
  return applyPrimerChoice(world, character, Number(trimmed) - 1, runtime);
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
    lines.push(`  ${ranked.name} · ${romanRank(leaf.rank)} (courtesy)`);
    lines.push(`    Rank ${String(leaf.rank)}. ${numberLine(ranked)}`);
    lines.push(`    Penned by ${leaf.pennedBy}.`);
  }
  if (!findKnownSpell(character, "ember") && school !== "ember") {
    lines.push("Orchard practice: Ember remains Flint's spark. Type cast ember.");
  }
  lines.push("Type spells ember to open one leaf.");
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

export type { PrimerChoiceCard, PrimerChoiceKind };
