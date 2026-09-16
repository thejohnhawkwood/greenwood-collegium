export const NPC_PLATE_FILES = [
  "npc-porter-bramble",
  "npc-headmaster-alder",
  "npc-librarian-quill",
  "npc-healer-fen",
  "npc-groundskeeper-tansy",
  "npc-instructor-flint",
  "practice-dummy",
] as const;

const NPC_PLATE_ALIASES: Record<string, string> = {
  "npc-porter-bramble": "npc-porter-bramble",
  "npc-headmaster-alder": "npc-headmaster-alder",
  "npc-librarian-quill": "npc-librarian-quill",
  "npc-healer-fen": "npc-healer-fen",
  "npc-groundskeeper-tansy": "npc-groundskeeper-tansy",
  "npc-instructor-flint": "npc-instructor-flint",
  "practice-dummy": "practice-dummy",
  "enemy-practice-dummy-south-orchard": "practice-dummy",
};

export function npcArtSrc(id: string): string | undefined {
  const plate = NPC_PLATE_ALIASES[id];
  return plate ? `/art/characters/npcs/${plate}.png` : undefined;
}
