import type { PlayState } from "@greenwood/contracts";

export const COMMAND_WORDS = [
  "look",
  "l",
  "say",
  "north",
  "south",
  "east",
  "west",
  "n",
  "s",
  "e",
  "w",
  "move",
  "go",
  "take",
  "get",
  "drop",
  "examine",
  "ex",
  "x",
  "talk",
  "inventory",
  "i",
  "attack",
  "cast",
  "ember",
  "help",
  "where",
  "place",
  "stats",
  "equip",
  "wield",
  "travel",
  "journey",
  "map",
  "chart",
  "quest",
  "quests",
] as const;

const SEND_REMINDERS = new Set(["look", "help", "inventory", "quests", "map", "stats"]);

export type CommandCompletion = {
  value: string;
  matches: string[];
};

export function completeCommand(
  input: string,
  candidates: readonly string[] = [],
): CommandCompletion {
  const match = /^(.*?)(\S*)$/u.exec(input);
  const prefix = match?.[1] ?? "";
  const token = (match?.[2] ?? "").toLowerCase();
  if (token.length === 0) {
    return { value: input, matches: [] };
  }
  const pool = prefix.trim().length === 0 ? COMMAND_WORDS : candidates;
  const matches = [...new Set(pool.filter((word) => word.toLowerCase().startsWith(token)))].sort(
    (left, right) => left.localeCompare(right),
  );
  if (matches.length === 0) {
    return { value: input, matches: [] };
  }
  return { value: prefix + sharedPrefix(matches), matches };
}

export function reminderWords(state?: PlayState): { word: string; send: boolean }[] {
  const base = ["look", "say", "talk", "take", "travel", "help"].map((word) => ({
    word,
    send: SEND_REMINDERS.has(word),
  }));
  const spoken = (state?.conversation?.choices ?? []).map((choice) => ({
    word: `say ${choice.say}`,
    send: true,
  }));
  return [...base, ...spoken];
}

export function completionCandidates(state?: PlayState): string[] {
  return [
    ...(state?.conversation?.choices.map((choice) => choice.say) ?? []),
    ...(state?.conversation?.choices.map((choice) => choice.label) ?? []),
    ...(state?.bag.map((item) => item.name) ?? []),
    ...(state?.room.visible.map((entity) => entity.name) ?? []),
    ...(state?.minimap.rooms.flatMap((room) => (room.title ? [room.title] : [])) ?? []),
  ];
}

function sharedPrefix(words: readonly string[]): string {
  const [first, ...rest] = words;
  if (!first) {
    return "";
  }
  let prefix = first;
  for (const word of rest) {
    while (!word.toLowerCase().startsWith(prefix.toLowerCase())) {
      prefix = prefix.slice(0, -1);
    }
  }
  return prefix;
}
