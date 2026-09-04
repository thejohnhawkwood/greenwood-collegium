import type { MoveIntent } from "./state.js";

const canonicalByAlias = new Map<string, string>([
  ["north", "north"],
  ["n", "north"],
  ["south", "south"],
  ["s", "south"],
  ["east", "east"],
  ["e", "east"],
  ["west", "west"],
  ["w", "west"],
  ["up", "up"],
  ["u", "up"],
  ["down", "down"],
  ["d", "down"],
]);

export function canonicalDirection(token: string): string | undefined {
  return canonicalByAlias.get(token.trim().toLowerCase());
}

export function parseMoveCommand(raw: string, characterId: string): MoveIntent | null {
  const tokens = raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
  if (tokens.length === 1) {
    const direction = canonicalDirection(tokens[0] ?? "");
    if (!direction) {
      return null;
    }
    return { verb: "move", characterId, direction };
  }

  if (tokens.length === 2 && tokens[0] === "go") {
    const target = tokens[1] ?? "";
    return {
      verb: "move",
      characterId,
      direction: canonicalDirection(target) ?? target,
    };
  }

  return null;
}
