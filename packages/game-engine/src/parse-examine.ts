import type { ExamineIntent } from "./state.js";

export function parseExamineCommand(raw: string, characterId: string): ExamineIntent | null {
  const match = /^(?:examine|ex|x)\s+(.+)$/iu.exec(raw.trim());
  const target = match?.[1]?.trim();
  if (!target) {
    return null;
  }
  return { verb: "examine", characterId, target };
}
