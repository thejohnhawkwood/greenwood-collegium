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
  "practice-dummy",
  "silk-hatchling",
  "silk-queen",
  "mist-crow",
  "barrow-guard",
  "fog-walker",
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
};

const NPC_ART_REV = "east-watch-1";

export function npcArtSrc(id: string): string | undefined {
  const plate = NPC_PLATE_ALIASES[id];
  return plate ? `/art/characters/npcs/${plate}.png?v=${NPC_ART_REV}` : undefined;
}
