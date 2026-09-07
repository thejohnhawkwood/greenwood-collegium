import type { DropIntent } from "./state.js";

export function parseDropCommand(raw: string, characterId: string): DropIntent | null {
  const match = /^drop\s+(.+)$/iu.exec(raw.trim());
  const target = match?.[1]?.trim();
  if (!target) {
    return null;
  }
  return { verb: "drop", characterId, target };
}
