import { parseAttackCommand } from "./parse-attack.js";
import { parseCastCommand } from "./parse-cast.js";
import { parseDropCommand } from "./parse-drop.js";
import { parseExamineCommand } from "./parse-examine.js";
import { parseHelpCommand } from "./parse-help.js";
import { parseInventoryCommand } from "./parse-inventory.js";
import { parseLookCommand } from "./parse-look.js";
import { parseMoveCommand } from "./parse-move.js";
import { parseQuestsCommand } from "./parse-quests.js";
import { parseSayCommand } from "./parse-say.js";
import { parseStaffCommand } from "./parse-staff.js";
import { parseTakeCommand } from "./parse-take.js";
import type { PlayerCommand } from "./state.js";

export function parsePlayerCommand(raw: string, characterId: string): PlayerCommand | null {
  return (
    parseHelpCommand(raw, characterId) ??
    parseQuestsCommand(raw, characterId) ??
    parseLookCommand(raw, characterId) ??
    parseSayCommand(raw, characterId) ??
    parseStaffCommand(raw, characterId) ??
    parseInventoryCommand(raw, characterId) ??
    parseTakeCommand(raw, characterId) ??
    parseDropCommand(raw, characterId) ??
    parseExamineCommand(raw, characterId) ??
    parseCastCommand(raw, characterId) ??
    parseAttackCommand(raw, characterId) ??
    parseMoveCommand(raw, characterId)
  );
}
