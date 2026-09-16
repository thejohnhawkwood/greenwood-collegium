import type { TravelIntent } from "./state.js";

export function parseTravelCommand(raw: string, characterId: string): TravelIntent | null {
  const match = /^(travel|journey)\s+(.+)$/iu.exec(raw.trim());
  if (!match?.[2]?.trim()) {
    return raw.trim().toLowerCase() === "travel" || raw.trim().toLowerCase() === "journey"
      ? { verb: "travel", characterId, target: "" }
      : null;
  }
  return { verb: "travel", characterId, target: match[2].trim() };
}
