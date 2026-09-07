import { parseAttackCommand } from "./parse-attack.js";
import { parseDropCommand } from "./parse-drop.js";
import { parseExamineCommand } from "./parse-examine.js";
import { parseInventoryCommand } from "./parse-inventory.js";
import { parseLookCommand } from "./parse-look.js";
import { parseMoveCommand } from "./parse-move.js";
import { parseSayCommand } from "./parse-say.js";
import { parseTakeCommand } from "./parse-take.js";
import type { PlayerCommand } from "./state.js";

export function parsePlayerCommand(raw: string, characterId: string): PlayerCommand | null {
  return (
    parseLookCommand(raw, characterId) ??
    parseSayCommand(raw, characterId) ??
    parseInventoryCommand(raw, characterId) ??
    parseTakeCommand(raw, characterId) ??
    parseDropCommand(raw, characterId) ??
    parseExamineCommand(raw, characterId) ??
    parseAttackCommand(raw, characterId) ??
    parseMoveCommand(raw, characterId)
  );
}
