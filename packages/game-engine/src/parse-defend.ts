import type { DefendIntent } from "./state.js";

export function parseDefendCommand(raw: string, characterId: string): DefendIntent | null {
  if (!/^(defend|guard|block)$/iu.test(raw.trim())) {
    return null;
  }
  return { verb: "defend", characterId };
}
