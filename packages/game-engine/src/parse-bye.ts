import type { ByeIntent } from "./state.js";

export function parseByeCommand(raw: string, characterId: string): ByeIntent | null {
  if (!/^(bye|goodbye|close)$/iu.test(raw.trim())) {
    return null;
  }
  return { verb: "bye", characterId };
}
