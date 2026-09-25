export const NPC_PLATE_FILES = [
  "npc-porter-bramble",
  "npc-headmaster-alder",
  "npc-librarian-quill",
  "npc-healer-fen",
  "npc-groundskeeper-tansy",
  "npc-instructor-flint",
  "npc-mentor-cinder",
  "npc-mentor-briar",
  "npc-mentor-mist",
  "npc-mentor-lumen",
  "npc-mentor-quern",
  "npc-mentor-edge",
  "npc-piper-mole",
  "npc-shepherd-wren",
  "npc-collegian-quire",
  "npc-stairkeeper-vane",
  "npc-scout-tern",
  "practice-dummy",
  "silk-hatchling",
  "silk-queen",
  "mist-crow",
  "barrow-guard",
  "fog-walker",
  "peat-adder",
  "npc-foldhand-hobb",
  "npc-reedcutter-sile",
  "npc-stoneward-kern",
  "npc-skipper-marram",
  "npc-deckhand-nett",
  "npc-heron-midge",
  "fold-hound",
  "reed-wisp",
  "ditch-lurker",
  "deck-hand",
  "rope-sentry",
  "river-captain",
  "race-pike",
  "shellington",
  "archive-bat",
  "withy-sentry",
  "college-raider",
  "college-raider-badger",
  "college-raider-rat",
  "college-raider-stoat",
  "raid-captain",
] as const;

const NPC_PLATE_ALIASES: Record<string, string> = {
  "npc-porter-bramble": "npc-porter-bramble",
  "npc-headmaster-alder": "npc-headmaster-alder",
  "npc-librarian-quill": "npc-librarian-quill",
  "npc-healer-fen": "npc-healer-fen",
  "npc-groundskeeper-tansy": "npc-groundskeeper-tansy",
  "npc-instructor-flint": "npc-instructor-flint",
  "npc-mentor-cinder": "npc-mentor-cinder",
  "npc-mentor-briar": "npc-mentor-briar",
  "npc-mentor-mist": "npc-mentor-mist",
  "npc-mentor-lumen": "npc-mentor-lumen",
  "npc-mentor-quern": "npc-mentor-quern",
  "npc-mentor-edge": "npc-mentor-edge",
  "npc-piper-mole": "npc-piper-mole",
  "npc-shepherd-wren": "npc-shepherd-wren",
  "npc-collegian-quire": "npc-collegian-quire",
  "npc-stairkeeper-vane": "npc-stairkeeper-vane",
  "npc-scout-tern": "npc-scout-tern",
  "practice-dummy": "practice-dummy",
  "enemy-practice-dummy-south-orchard": "practice-dummy",
  "enemy-practice-dummy-hearth-ember": "practice-dummy",
  "enemy-practice-dummy-hearth-thorn": "practice-dummy",
  "enemy-practice-dummy-hearth-veil": "practice-dummy",
  "enemy-practice-dummy-hearth-stars": "practice-dummy",
  "enemy-practice-dummy-hearth-stone": "practice-dummy",
  "enemy-practice-dummy-hearth-steel": "practice-dummy",
  "silk-hatchling": "silk-hatchling",
  "enemy-silk-hatchling-cocoon-nave": "silk-hatchling",
  "silk-queen": "silk-queen",
  "enemy-silk-queen-deep-cradle": "silk-queen",
  "mist-crow": "mist-crow",
  "enemy-mist-crow-sheepfold": "mist-crow",
  "barrow-guard": "barrow-guard",
  "enemy-barrow-guard-barrow-mouth": "barrow-guard",
  "fog-walker": "fog-walker",
  "enemy-fog-walker-fog-hollow": "fog-walker",
  "peat-adder": "peat-adder",
  "enemy-peat-adder-peat-cut": "peat-adder",
  "npc-foldhand-hobb": "npc-foldhand-hobb",
  "npc-reedcutter-sile": "npc-reedcutter-sile",
  "npc-stoneward-kern": "npc-stoneward-kern",
  "npc-skipper-marram": "npc-skipper-marram",
  "npc-deckhand-nett": "npc-deckhand-nett",
  "npc-heron-midge": "npc-heron-midge",
  "fold-hound": "fold-hound",
  "enemy-fold-hound-mist-lane": "fold-hound",
  "reed-wisp": "reed-wisp",
  "enemy-reed-wisp-reed-mere": "reed-wisp",
  "ditch-lurker": "ditch-lurker",
  "enemy-ditch-lurker-black-ditch": "ditch-lurker",
  "deck-hand": "deck-hand",
  "enemy-deck-hand-skiff-line": "deck-hand",
  "rope-sentry": "rope-sentry",
  "enemy-rope-sentry-rope-island": "rope-sentry",
  "river-captain": "river-captain",
  "enemy-river-captain-pirate-camp": "river-captain",
  "race-pike": "race-pike",
  "enemy-race-pike-mill-race": "race-pike",
  shellington: "shellington",
  "enemy-shellington-crow-stile": "shellington",
  "archive-bat": "archive-bat",
  "enemy-archive-bat-root": "archive-bat",
  "enemy-archive-bat-shelf": "archive-bat",
  "enemy-archive-bat-stair": "archive-bat",
  "withy-sentry": "withy-sentry",
  "enemy-withy-sentry-osier-holt": "withy-sentry",
  "college-raider": "college-raider",
  "raid-captain": "raid-captain",
};

const NPC_ART_REV = "comic-ink-3";

/** Four vicious faces. A defense spawn keeps the same one for that id. */
export const RAIDER_PLATES = [
  "college-raider",
  "college-raider-badger",
  "college-raider-rat",
  "college-raider-stoat",
] as const;

export function raiderPlateForSpawn(id: string): (typeof RAIDER_PLATES)[number] {
  let hash = 0;
  for (const char of id) {
    hash = (Math.imul(hash, 33) + char.charCodeAt(0)) >>> 0;
  }
  return RAIDER_PLATES[hash % RAIDER_PLATES.length] ?? "college-raider";
}

export function npcArtSrc(id: string): string | undefined {
  const plate = id.endsWith("-captain") || id === "raid-captain"
    ? "raid-captain"
    : id.startsWith("defense-")
      ? raiderPlateForSpawn(id)
      : NPC_PLATE_ALIASES[id];
  return plate ? `/art/characters/npcs/${plate}.png?v=${NPC_ART_REV}` : undefined;
}
