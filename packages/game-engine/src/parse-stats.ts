import type { StatsIntent } from "./state.js";

export function parseStatsCommand(raw: string, characterId: string): StatsIntent | null {
  if (raw.trim().toLowerCase() !== "stats") {
    return null;
  }
  return { verb: "stats", characterId };
}
