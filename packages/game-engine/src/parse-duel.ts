import type { DuelIntent } from "./state.js";

export function parseDuelCommand(raw: string, characterId: string): DuelIntent | null {
  const line = raw.trim();
  const accept = /^(?:duel\s+)?accept(?:\s+(.*))?$/iu.exec(line);
  if (accept && (/^accept\b/iu.test(line) || /^duel\s+accept\b/iu.test(line))) {
    const target = accept[1]?.trim();
    return {
      verb: "duel",
      characterId,
      action: "accept",
      ...(target ? { target } : {}),
    };
  }
  if (/^(?:duel\s+)?decline\b/iu.test(line)) {
    return { verb: "duel", characterId, action: "decline" };
  }
  const challenge = /^duel(?:\s+(.*))?$/iu.exec(line);
  if (!challenge) {
    return null;
  }
  return { verb: "duel", characterId, action: "challenge", target: challenge[1]?.trim() ?? "" };
}
