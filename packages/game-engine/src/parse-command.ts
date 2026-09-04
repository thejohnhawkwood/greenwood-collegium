import { parseLookCommand } from "./parse-look.js";
import { parseMoveCommand } from "./parse-move.js";
import { parseSayCommand } from "./parse-say.js";
import type { PlayerCommand } from "./state.js";

export function parsePlayerCommand(raw: string, characterId: string): PlayerCommand | null {
  return (
    parseLookCommand(raw, characterId) ??
    parseSayCommand(raw, characterId) ??
    parseMoveCommand(raw, characterId)
  );
}
