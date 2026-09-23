import type { InkIntent } from "./state.js";

const INK_WORDS = /^ink(?:\s+(.+))?$/u;

export function parseInkCommand(raw: string, characterId: string): InkIntent | null {
  const match = raw.trim().toLowerCase().match(INK_WORDS);
  if (!match) {
    return null;
  }
  const target = match[1]?.trim();
  if (!target) {
    return null;
  }
  return { verb: "ink", characterId, target };
}
