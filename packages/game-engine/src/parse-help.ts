import type { HelpIntent } from "./state.js";

const HELP_PATTERN = /^\s*help(?:\s+(.+?))?\s*$/iu;

export function parseHelpCommand(raw: string, characterId: string): HelpIntent | null {
  const match = HELP_PATTERN.exec(raw);
  if (!match) {
    return null;
  }
  const topic = match[1]?.trim();
  return topic ? { verb: "help", characterId, topic } : { verb: "help", characterId };
}
