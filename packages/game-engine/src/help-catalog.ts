export type HelpEntry = {
  topic: string;
  aliases: string[];
  summary: string;
  detail: string;
};

export const HELP_ENTRIES: readonly HelpEntry[] = [
  {
    topic: "look",
    aliases: ["look", "l"],
    summary: "Describe the room you are in.",
    detail:
      "look describes the room, people, objects, items on the ground, and exits. Type look after you arrive so you can see what Porter mentioned. where and place reprint the same room.",
  },
  {
    topic: "say",
    aliases: ["say"],
    summary: "Speak so people in the room can hear you.",
    detail: "say hello speaks those words in the room. Example: say hello",
  },
  {
    topic: "move",
    aliases: ["north", "south", "east", "west", "n", "s", "e", "w", "move", "go"],
    summary: "Walk a direction if there is an exit.",
    detail:
      "Type a direction by itself: north, south, east, or west. From Lantern Court, north leads to the Great Hall.",
  },
  {
    topic: "take",
    aliases: ["take", "get"],
    summary: "Pick up something you can see.",
    detail:
      "take Small Copper Key picks up that item. If more than one key or weapon is visible, the game asks which one and names the full take command. Arrival only accepts the full key name.",
  },
  {
    topic: "drop",
    aliases: ["drop"],
    summary: "Put something you are carrying on the ground.",
    detail: "drop key places a matching carried item in the room.",
  },
  {
    topic: "examine",
    aliases: ["examine", "ex", "x"],
    summary: "Look more closely at a person, object, or item.",
    detail:
      "examine porter looks at Porter Bramble. x porter does the same. Look and examine also describe nearby Collegians. The Practice Dummy is a well-worn straw target in the South Orchard.",
  },
  {
    topic: "talk",
    aliases: ["talk"],
    summary: "Talk to a nearby member of staff and discover quests.",
    detail:
      "talk porter (or talk to Porter Bramble) starts a private, written conversation with a nearby NPC. If the staff offer choices, type say 1, say 2, say 3, say yes, or say no. Talk to Librarian Quill, Groundskeeper Tansy, or Headmaster Alder for a quest. Type quests for your checklist. Use say to speak to other Collegians.",
  },
  {
    topic: "inventory",
    aliases: ["inventory", "i"],
    summary: "List what you are carrying.",
    detail: "inventory (or i) lists items in your pack.",
  },
  {
    topic: "attack",
    aliases: ["attack"],
    summary: "Start a practice fight.",
    detail:
      "Walk south from Lantern Court, then type attack dummy. Later attacks can omit the name while the fight lasts.",
  },
  {
    topic: "cast",
    aliases: ["cast"],
    summary: "Cast a known spell during a fight.",
    detail:
      "cast ember dummy spends focus and scorches the Practice Dummy. Ember also leaves burning.",
  },
  {
    topic: "help",
    aliases: ["help"],
    summary: "List commands, or explain one word.",
    detail: "help lists every command the Collegium understands today. help look explains look.",
  },
  {
    topic: "where",
    aliases: ["where", "place"],
    summary: "Reprint the room you are in.",
    detail:
      "where and place reprint the current room title and description, the same truth as look.",
  },
  {
    topic: "stats",
    aliases: ["stats"],
    summary: "Show health, location, and what you hold.",
    detail: "stats prints your health, the room title, and the item in your hand.",
  },
  {
    topic: "quests",
    aliases: ["quest", "quests"],
    summary: "Show your current tasks.",
    detail:
      "quests lists your active and completed tasks, with a checklist of discoveries. Talk to staff to find more quests. Return and talk to the quest giver after investigating the named clues.",
  },
];

export function findHelpEntry(topic: string): HelpEntry | undefined {
  const needle = topic.trim().toLowerCase();
  if (needle.length === 0) {
    return undefined;
  }
  return HELP_ENTRIES.find((entry) => entry.aliases.includes(needle) || entry.topic === needle);
}

export function formatHelpList(): string {
  const lines = HELP_ENTRIES.map((entry) => `  ${entry.topic} — ${entry.summary}`);
  return [
    "The Collegium understands these words:",
    ...lines,
    "Type help look to read more about look.",
  ].join("\n");
}
