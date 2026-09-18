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
  "drink",
  "sip",
  "eat",
  "nibble",
  "examine",
  "ex",
  "x",
  "talk",
  "bye",
  "goodbye",
  "close",
  "inventory",
  "i",
  "attack",
  "cast",
  "defend",
  "guard",
  "block",
  "flee",
  "run",
  "retreat",
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
  "duel",
  "accept",
  "decline",
] as const;

const SEND_REMINDERS = new Set(["look", "help", "inventory", "quests", "map", "stats"]);

export const COMMAND_SHORTCUTS = [
  { key: "l", word: "look", send: true },
  { key: "s", word: "say", send: false },
  { key: "t", word: "talk", send: false },
  { key: "k", word: "take", send: false },
  { key: "i", word: "inventory", send: true },
  { key: "h", word: "help", send: true },
  { key: "q", word: "quests", send: true },
  { key: "m", word: "map", send: true },
  { key: "x", word: "examine", send: false },
] as const;

export function shortcutForKey(key: string) {
  const needle = key.length === 1 ? key.toLowerCase() : "";
  return COMMAND_SHORTCUTS.find((entry) => entry.key === needle);
}

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

export function reminderWords(
  state?: PlayState,
  conversation = state?.conversation,
): { word: string; send: boolean; shortcut?: string }[] {
  const base = ["look", "say", "talk", "take", "travel", "help"].map((word) => {
    const shortcut = COMMAND_SHORTCUTS.find((entry) => entry.word === word);
    return {
      word,
      send: SEND_REMINDERS.has(word),
      ...(shortcut ? { shortcut: shortcut.key } : {}),
    };
  });
  const spoken = (conversation?.choices ?? []).map((choice) => ({
    word: `say ${choice.say}`,
    send: true,
  }));
  const dismiss = conversation ? [{ word: "bye", send: true }] : [];
  const combat = (state?.encounter?.moves ?? []).map((move) => ({
    word: move.command,
    send: true,
  }));
  return [...combat, ...base, ...spoken, ...dismiss];
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
