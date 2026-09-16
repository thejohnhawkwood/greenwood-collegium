import type { MapIntent } from "./state.js";

export function parseMapCommand(raw: string, characterId: string): MapIntent | null {
  const normalized = raw.trim().toLowerCase();
  if (normalized !== "map" && normalized !== "chart") {
    return null;
  }
  return { verb: "map", characterId };
}
