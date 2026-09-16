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
import { parseTalkCommand } from "./parse-talk.js";
import { parseByeCommand } from "./parse-bye.js";
import { parseDrinkCommand } from "./parse-drink.js";
import { parseEatCommand } from "./parse-eat.js";
import { parseStatsCommand } from "./parse-stats.js";
import { parseEquipCommand } from "./parse-equip.js";
import { parseMapCommand } from "./parse-map.js";
import { parseTravelCommand } from "./parse-travel.js";
import type { PlayerCommand } from "./state.js";

export function parsePlayerCommand(raw: string, characterId: string): PlayerCommand | null {
  return (
    parseHelpCommand(raw, characterId) ??
    parseQuestsCommand(raw, characterId) ??
    parseStatsCommand(raw, characterId) ??
    parseMapCommand(raw, characterId) ??
    parseTravelCommand(raw, characterId) ??
    parseEquipCommand(raw, characterId) ??
    parseLookCommand(raw, characterId) ??
    parseSayCommand(raw, characterId) ??
    parseStaffCommand(raw, characterId) ??
    parseInventoryCommand(raw, characterId) ??
    parseTakeCommand(raw, characterId) ??
    parseDropCommand(raw, characterId) ??
    parseExamineCommand(raw, characterId) ??
    parseTalkCommand(raw, characterId) ??
    parseByeCommand(raw, characterId) ??
    parseDrinkCommand(raw, characterId) ??
    parseEatCommand(raw, characterId) ??
    parseCastCommand(raw, characterId) ??
    parseAttackCommand(raw, characterId) ??
    parseMoveCommand(raw, characterId)
  );
}
