import type { SpellsIntent } from "./state.js";

export function parseSpellsCommand(raw: string, characterId: string): SpellsIntent | null {
  const normalized = raw.trim().toLowerCase();
  if (
    normalized === "spells" ||
    normalized === "spell" ||
    normalized === "grimoire" ||
    normalized === "book"
  ) {
    return { verb: "spells", characterId };
  }
  return null;
}
