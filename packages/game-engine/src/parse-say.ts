import type { SayIntent } from "./state.js";

export function parseSayCommand(raw: string, characterId: string): SayIntent | null {
  const match = raw.match(/^\s*say(?:\s+(.*))?$/i);
  if (!match) {
    return null;
  }
  return { verb: "say", characterId, text: match[1] ?? "" };
}
