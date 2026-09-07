import type { AttackIntent } from "./state.js";

export function parseAttackCommand(raw: string, characterId: string): AttackIntent | null {
  const match = /^attack(?:\s+(.+))?$/iu.exec(raw.trim());
  if (!match) {
    return null;
  }
  const target = match[1]?.trim();
  if (target) {
    return { verb: "attack", characterId, target };
  }
  return { verb: "attack", characterId };
}
