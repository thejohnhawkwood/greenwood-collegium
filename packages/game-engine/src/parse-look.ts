import type { LookIntent } from "./state.js";

export function parseLookCommand(raw: string, characterId: string): LookIntent | null {
  const normalized = raw.trim().toLowerCase();
  if (normalized === "look" || normalized === "l") {
    return { verb: "look", characterId };
  }
  return null;
}
