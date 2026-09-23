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
      "take key picks up a matching item you can see. If more than one key or weapon is visible, the game asks which one and names the full take command.",
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
      "examine porter looks at Porter Bramble. x porter does the same. Look and examine also describe nearby Collegians. The Practice Dummy is a well-worn straw target in the South Orchard. Each School hearth keeps one as well.",
  },
  {
    topic: "talk",
    aliases: ["talk"],
    summary: "Talk to a nearby member of staff and discover quests.",
    detail:
      "talk porter (or talk to Porter Bramble) starts a private, written conversation with a nearby NPC. If the staff offer choices, type say 1, say 2, say 3, say yes, or say no. Type bye or press the × to step back and click other things in the room. Talk to Librarian Quill, Groundskeeper Tansy, or Headmaster Alder for a quest. Type quests for your checklist. Use say to speak to other Collegians.",
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
      "Walk south from Lantern Court, then type attack dummy to square up. The foe card opens. Type attack, a spell, defend, or flee within twelve seconds. Later attacks can omit the name while the fight lasts. To fight a classmate, both of you must agree. Type duel and their name.",
  },
  {
    topic: "duel",
    aliases: ["duel", "accept", "decline"],
    summary: "Ask a classmate to duel. Both must agree.",
    detail:
      "Type duel and the given name of a classmate standing in the same room. They type duel accept or duel decline. Attack on a classmate without an accepted duel is refused. Type 1 or 2 if the challenge prompt is open.",
  },
  {
    topic: "defend",
    aliases: ["defend", "guard", "block"],
    summary: "Raise a guard and take half the next blow.",
    detail:
      "defend (or guard, block) locks a guard for this turn. The foe still answers, but the hit is halved. If the twelve-second clock runs out, the lesson chooses defend for you.",
  },
  {
    topic: "flee",
    aliases: ["flee", "run", "retreat"],
    summary: "Step out of a fight without a harsh loss.",
    detail:
      "flee (or run, retreat) ends the lesson. You stay in the room. Classroom fights do not take your items.",
  },
  {
    topic: "cast",
    aliases: ["cast"],
    summary: "Cast a known spell during a fight.",
    detail:
      "cast ember dummy squares up if you are not already fighting, then cast ember locks the spell. Ember is Flint's orchard practice spark. School leaves open in your Field Primer after first lessons, then three clickable leaves (or typed 1 / 2 / 3).",
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
    topic: "drink",
    aliases: ["drink", "sip"],
    summary: "Drink from the courtyard well to restore health and focus.",
    detail:
      "drink well (or sip) at the Courtyard Well in Lantern Court restores health and focus. A little of each also returns every few seconds while you are not in a fight.",
  },
  {
    topic: "eat",
    aliases: ["eat", "nibble", "taste"],
    summary: "Eat fallen apples to restore health and focus.",
    detail:
      "eat apple (or nibble) at the Fallen Apples in the South Orchard restores health and focus. Drink from the courtyard well if you are in Lantern Court instead.",
  },
  {
    topic: "spells",
    aliases: ["spells", "spell", "grimoire", "book"],
    summary: "List the spells you have been taught.",
    detail:
      "spells (or grimoire) reads your Field Primer: ranks, numbers, and the mentor's hand. Type spells ember to open one leaf. Open the Primer and type ink and a vein's name to spend ink. Type the listed cast words during a fight.",
  },
  {
    topic: "stats",
    aliases: ["stats"],
    summary: "Show health, School, Primer leaves, and the next lesson.",
    detail:
      "stats prints health, focus, School, Primer leaves, the next lesson, the room title, and the item you have equipped.",
  },
  {
    topic: "equip",
    aliases: ["equip", "wield"],
    summary: "Hold a carried item or a practice weapon.",
    detail:
      "equip sword (or wield Practice Sword) sets what you hold. take on a practice weapon also equips it. unequip sword (or take off Practice Sword) puts it back in the bag. stats shows the equipped item.",
  },
  {
    topic: "travel",
    aliases: ["travel", "journey"],
    summary: "Follow known paths to a room you have already visited.",
    detail:
      "travel Library Stacks (or journey west cloister) moves you along rooms you have already found. Fogged names stay hidden. You cannot travel during combat.",
  },
  {
    topic: "map",
    aliases: ["map", "chart"],
    summary: "Read your explored rooms and how much of the Collegium remains in fog.",
    detail:
      "map (or chart) names the rooms you have already visited, marks where you stand, names the floor, and says how many charted rooms remain in fog. It does not name unvisited rooms.",
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
