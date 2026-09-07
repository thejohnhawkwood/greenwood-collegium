import type { InventoryIntent } from "./state.js";

export function parseInventoryCommand(raw: string, characterId: string): InventoryIntent | null {
  const normalized = raw.trim().toLowerCase();
  if (normalized === "inventory" || normalized === "i" || normalized === "bag") {
    return { verb: "inventory", characterId };
  }
  return null;
}
