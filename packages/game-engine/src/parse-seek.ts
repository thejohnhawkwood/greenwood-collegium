import type { SeekIntent } from "./state.js";

export function parseSeekCommand(raw: string, characterId: string): SeekIntent | null {
  const match = /^seek(?:\s+(.+))?$/iu.exec(raw.trim());
  if (!match) return null;
  return { verb: "seek", characterId, target: match[1]?.trim() ?? "" };
}
