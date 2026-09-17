import type { FleeIntent } from "./state.js";

export function parseFleeCommand(raw: string, characterId: string): FleeIntent | null {
  if (!/^(flee|run|retreat)$/iu.test(raw.trim())) {
    return null;
  }
  return { verb: "flee", characterId };
}
