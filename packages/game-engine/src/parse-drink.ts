import type { DrinkIntent } from "./state.js";

export function parseDrinkCommand(raw: string, characterId: string): DrinkIntent | null {
  const match = /^(?:drink|sip)(?:\s+(?:from\s+)?(.+))?$/iu.exec(raw.trim());
  if (!match) {
    return null;
  }
  const target = match[1]?.trim();
  return target ? { verb: "drink", characterId, target } : { verb: "drink", characterId };
}
