import type { TalkIntent } from "./state.js";

export function parseTalkCommand(raw: string, characterId: string): TalkIntent | null {
  const match = /^talk\s+(?:to\s+)?(.+)$/iu.exec(raw.trim());
  const target = match?.[1]?.trim();
  if (!target || target.toLowerCase() === "to") return null;
  return { verb: "talk", characterId, target };
}
