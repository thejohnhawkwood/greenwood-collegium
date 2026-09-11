import type { SayIntent } from "./state.js";

export function parseSayCommand(raw: string, characterId: string): SayIntent | null {
  const match = raw.match(/^\s*say(?:\s+(.*))?$/i);
  if (match) {
    return { verb: "say", characterId, text: match[1] ?? "" };
  }
  const bare = raw.trim();
  if (/^(?:[1-9]|yes|no)$/iu.test(bare)) {
    return { verb: "say", characterId, text: bare };
  }
  return null;
}
