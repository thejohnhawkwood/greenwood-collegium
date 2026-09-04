import { parseLookCommand } from "./parse-look.js";
import { parseMoveCommand } from "./parse-move.js";
import type { PlayerCommand } from "./state.js";

export function parsePlayerCommand(raw: string, characterId: string): PlayerCommand | null {
  return parseLookCommand(raw, characterId) ?? parseMoveCommand(raw, characterId);
}
