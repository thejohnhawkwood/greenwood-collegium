import type { SpellsIntent } from "./state.js";

const BOOK_WORDS = /^(?:spells|spell|grimoire|book)(?:\s+(.+))?$/u;

export function parseSpellsCommand(raw: string, characterId: string): SpellsIntent | null {
  const match = raw.trim().toLowerCase().match(BOOK_WORDS);
  if (!match) {
    return null;
  }
  const target = match[1]?.trim();
  return target ? { verb: "spells", characterId, target } : { verb: "spells", characterId };
}
