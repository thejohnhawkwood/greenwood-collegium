import type { EatIntent } from "./state.js";

export function parseEatCommand(raw: string, characterId: string): EatIntent | null {
  const match = /^(?:eat|nibble|taste)(?:\s+(.+))?$/iu.exec(raw.trim());
  if (!match) {
    return null;
  }
  const target = match[1]?.trim();
  return target ? { verb: "eat", characterId, target } : { verb: "eat", characterId };
}
