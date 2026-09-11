import type { TakeIntent } from "./state.js";

export function parseTakeCommand(raw: string, characterId: string): TakeIntent | null {
  const match = /^(?:take|get)(?:\s+(.*))?$/iu.exec(raw.trim());
  if (!match) {
    return null;
  }
  return { verb: "take", characterId, target: match[1]?.trim() ?? "" };
}
