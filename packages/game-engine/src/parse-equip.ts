import type { EquipIntent } from "./state.js";

export function parseEquipCommand(raw: string, characterId: string): EquipIntent | null {
  const match = /^(?:equip|wield)(?:\s+(.*))?$/iu.exec(raw.trim());
  if (!match) {
    return null;
  }
  return { verb: "equip", characterId, target: match[1]?.trim() ?? "" };
}
