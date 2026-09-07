import type { CastIntent } from "./state.js";

export function parseCastCommand(raw: string, characterId: string): CastIntent | null {
  const match = /^cast(?:\s+(.+))?$/iu.exec(raw.trim());
  if (!match) {
    return null;
  }
  const rest = match[1]?.trim();
  if (!rest) {
    return { verb: "cast", characterId, spell: "" };
  }
  const parts = rest.split(/\s+/u);
  const spell = parts[0] ?? "";
  let target = parts.slice(1).join(" ").trim();
  if (target.toLowerCase().startsWith("at ")) {
    target = target.slice(3).trim();
  }
  if (target) {
    return { verb: "cast", characterId, spell, target };
  }
  return { verb: "cast", characterId, spell };
}
