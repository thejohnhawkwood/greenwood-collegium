import type { QuestsIntent } from "./state.js";

const QUESTS_PATTERN = /^\s*quests?\s*$/iu;

export function parseQuestsCommand(raw: string, characterId: string): QuestsIntent | null {
  if (!QUESTS_PATTERN.test(raw)) {
    return null;
  }
  return { verb: "quests", characterId };
}
