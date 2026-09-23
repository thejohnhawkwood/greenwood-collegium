import type { UnequipIntent } from "./state.js";

export function parseUnequipCommand(raw: string, characterId: string): UnequipIntent | null {
  const match = /^(?:unequip|take off)(?:\s+(.*))?$/iu.exec(raw.trim());
  if (!match) {
    return null;
  }
  return { verb: "unequip", characterId, target: match[1]?.trim() ?? "" };
}
