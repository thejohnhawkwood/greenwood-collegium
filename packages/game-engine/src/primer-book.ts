import type { EventEnvelope } from "@greenwood/contracts";
import { LEAF_GRAPHS, signatureSpellId, type LeafNode } from "./leaf-graphs.js";
import {
  applyRank,
  findKnownSpell,
  knownLeaves,
  markPrimerAwarded,
  primerAwarded,
  SCHOOL_MENTOR_PEN,
} from "./primer.js";
import type { Character, EngineRuntime, SchoolId, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

const SCHOOL_IDS = ["ember", "thorn", "veil", "stars", "stone", "steel"] as const;

export function leafIsOpen(character: Character, schoolId: SchoolId): boolean {
  return Boolean(findKnownSpell(character, signatureSpellId(schoolId)));
}

export function unspentInk(character: Character): number {
  const granted = (character.primerAwardedLevels ?? []).filter(
    (level) => level >= 4 && level <= 20,
  ).length;
  const signatures = new Set(
    SCHOOL_IDS.filter((id) => leafIsOpen(character, id)).map((id) => signatureSpellId(id)),
  );
  let spent = 0;
  for (const leaf of knownLeaves(character)) {
    spent += leaf.rank;
    if (signatures.has(leaf.spellId)) {
      spent -= 1;
    }
  }
  return Math.max(0, granted - spent);
}

export function parentsMet(character: Character, entry: LeafNode): boolean {
  if (entry.parents.length === 0) {
    return true;
  }
  const known = (id: string) => Boolean(findKnownSpell(character, id));
  if (entry.join === "and") {
    return entry.parents.every(known);
  }
  return entry.parents.some(known);
}

export function grantPrimerInk(
  character: Character,
  level: number,
  runtime: EngineRuntime,
): EventEnvelope[] {
  if (level < 4 || level > 20 || primerAwarded(character, level)) {
    return [];
  }
  markPrimerAwarded(character, level);
  return [
    systemNotice(
      character.id,
      "The Primer gains one ink. Open the book and choose a vein.",
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
  void world;
  let gained = 0;
  const last = Math.min(20, nextLevel);
  for (let level = Math.max(6, previousLevel + 1); level <= last; level += 1) {
    if (!primerAwarded(character, level)) {
      markPrimerAwarded(character, level);
      gained += 1;
    }
  }
  if (gained === 0) {
    return [];
  }
  const line =
    gained === 1
      ? "The Primer gains one ink. Open the book and choose a vein."
      : `The Primer gains ${String(gained)} ink. Open the book and choose a vein.`;
  return [systemNotice(character.id, line, runtime)];
}

type NodeHit = { schoolId: SchoolId; node: LeafNode };

function matchOpenNode(world: WorldState, character: Character, raw: string): NodeHit | undefined {
  const needle = raw.trim().toLowerCase();
  if (!needle) {
    return undefined;
  }
  const hits: NodeHit[] = [];
  for (const schoolId of SCHOOL_IDS) {
    if (!leafIsOpen(character, schoolId)) {
      continue;
    }
    for (const entry of LEAF_GRAPHS[schoolId].nodes) {
      const name = world.spells?.[entry.id]?.name.toLowerCase() ?? "";
      if (entry.id === needle || name === needle || (needle.length > 2 && name.includes(needle))) {
        hits.push({ schoolId, node: entry });
      }
    }
  }
  return hits.length === 1 ? hits[0] : undefined;
}

export type InkFailureCode = "character_not_found" | "not_inkable";

export function handleInk(
  world: WorldState,
  intent: { verb: "ink"; characterId: string; target: string },
  runtime: EngineRuntime,
): { ok: true; event: EventEnvelope } | { ok: false; code: InkFailureCode; message: string } {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: "Your character is not in the realm.",
    };
  }
  const match = matchOpenNode(world, character, intent.target);
  if (!match) {
    return {
      ok: false,
      code: "not_inkable",
      message: "That vein is not on an open leaf.",
    };
  }
  const known = findKnownSpell(character, match.node.id);
  if (!known && !parentsMet(character, match.node)) {
    return { ok: false, code: "not_inkable", message: "That node is still shut." };
  }
  if (known && known.rank >= 5) {
    return { ok: false, code: "not_inkable", message: "That leaf is already rank V." };
  }
  if (unspentInk(character) < 1) {
    return { ok: false, code: "not_inkable", message: "You have no ink to spend." };
  }
  const spell = world.spells?.[match.node.id];
  const name = spell?.name ?? match.node.id;
  const pennedBy = SCHOOL_MENTOR_PEN[match.schoolId];
  if (known) {
    known.rank += 1;
    return {
      ok: true,
      event: systemNotice(
        character.id,
        `${pennedBy} raises ${name} to rank ${String(known.rank)}.`,
        runtime,
      ),
    };
  }
  character.knownSpells = [
    ...knownLeaves(character),
    { spellId: match.node.id, rank: 1, pennedBy },
  ];
  return {
    ok: true,
    event: systemNotice(character.id, `${pennedBy} inks ${name} at rank I.`, runtime),
  };
}

const RANK_MARKS = ["I", "II", "III", "IV", "V"] as const;

export type PrimerRankView = {
  rank: number;
  mark: string;
  numbers?: string;
  held: boolean;
  spend: boolean;
};

export type PrimerNodeView = {
  id: string;
  name: string;
  distance: number;
  parents: string[];
  join?: "or" | "and";
  status: "locked" | "ready" | "inked" | "maxed";
  legal: boolean;
  rank?: number;
  numbers?: string;
  description?: string;
  ranks?: PrimerRankView[];
};

function rankLadder(
  spell: ReturnType<typeof applyRank> | undefined,
  heldRank: number,
  legal: boolean,
): PrimerRankView[] {
  const next = heldRank + 1;
  return [1, 2, 3, 4, 5].map((rank) => {
    const ranked = spell ? applyRank(spell, rank) : undefined;
    return {
      rank,
      mark: RANK_MARKS[rank - 1] ?? String(rank),
      ...(ranked ? { numbers: numberLine(ranked) } : {}),
      held: rank <= heldRank,
      spend: legal && rank === next,
    };
  });
}

function numberLine(spell: ReturnType<typeof applyRank>): string {
  const bits = [
    `Focus ${String(spell.focusCost)}`,
    spell.damage !== undefined ? `Damage ${String(spell.damage)}` : undefined,
    spell.heal !== undefined ? `Heal ${String(spell.heal)}` : undefined,
    spell.restoreFocus !== undefined ? `Restore ${String(spell.restoreFocus)} focus` : undefined,
    spell.burningRounds !== undefined ? `Burns ${String(spell.burningRounds)}` : undefined,
  ].filter((bit): bit is string => Boolean(bit));
  return bits.join(". ") + ".";
}

export function primerPlayState(world: WorldState, character: Character) {
  if (!character.schoolId && !SCHOOL_IDS.some((id) => leafIsOpen(character, id))) {
    return undefined;
  }
  const ink = unspentInk(character);
  return {
    ink,
    prompt:
      ink > 0
        ? `The Primer holds ${String(ink)} ink. Choose a vein.`
        : "The Primer is open. A later lesson grants ink.",
    leaves: SCHOOL_IDS.map((schoolId) => {
      const graph = LEAF_GRAPHS[schoolId];
      const open = leafIsOpen(character, schoolId);
      return {
        schoolId,
        title: graph.title,
        mentor: graph.mentor,
        outline: graph.outline,
        open,
        nodes: open
          ? graph.nodes.map((entry) => {
              const known = findKnownSpell(character, entry.id);
              const spell = world.spells?.[entry.id];
              const heldRank = known?.rank ?? 0;
              const ranked = spell ? applyRank(spell, Math.max(1, heldRank)) : undefined;
              const status = !parentsMet(character, entry)
                ? "locked"
                : !known
                  ? "ready"
                  : known.rank >= 5
                    ? "maxed"
                    : "inked";
              const legal =
                ink > 0 && (status === "ready" || (status === "inked" && (known?.rank ?? 5) < 5));
              return {
                id: entry.id,
                name: spell?.name ?? entry.id,
                distance: entry.distance,
                parents: [...entry.parents],
                ...(entry.join ? { join: entry.join } : {}),
                status,
                legal,
                ...(known ? { rank: known.rank } : {}),
                ...(ranked ? { numbers: numberLine(ranked) } : {}),
                ...(spell?.description ? { description: spell.description } : {}),
                ranks: rankLadder(spell, heldRank, legal),
              };
            })
          : [],
      };
    }),
  };
}

export function primerInkLine(character: Character): string {
  const ink = unspentInk(character);
  return ink === 1 ? "1 ink unspent." : `${String(ink)} ink unspent.`;
}
