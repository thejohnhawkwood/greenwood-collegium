import { itemsHeldBy } from "./items.js";
import type { Character, DialogueTree, RoomFixture, WorldState } from "./state.js";

export const PIPER_NPC_ID = "npc-piper-mole";
export const HOLM_WRAPPING_ID = "object-holm-wrapping";
export const WREN_NPC_ID = "npc-shepherd-wren";
export const FEN_NPC_ID = "npc-healer-fen";
export const FLINT_NPC_ID = "npc-instructor-flint";
export const TANSY_NPC_ID = "npc-groundskeeper-tansy";
export const QUILL_NPC_ID = "npc-librarian-quill";
export const ABBEY_MARK_RUBBING_TEMPLATE_ID = "abbey-mark-rubbing";

const STILL_SLEEPS_ID = "what-still-sleeps";

export const MEADOW_FORK_QUEST_ID = "the-meadow-fork";
export const UNCOUNTED_FLOCK_QUEST_ID = "the-uncounted-flock";
export const STONES_QUEST_ID = "the-stones-that-were-not-there";
export const BARROW_MOUTH_QUEST_ID = "the-barrow-mouth";
export const FOG_TOOK_QUEST_ID = "what-the-fog-took";
export const BRONZE_QUEST_ID = "the-bronze-in-the-hill";
export const WALKER_QUEST_ID = "the-thing-that-walks";

export const WREN_CHAIN_NEXT: Record<string, string> = {
  [MEADOW_FORK_QUEST_ID]: UNCOUNTED_FLOCK_QUEST_ID,
  [UNCOUNTED_FLOCK_QUEST_ID]: STONES_QUEST_ID,
  [STONES_QUEST_ID]: BARROW_MOUTH_QUEST_ID,
  [BARROW_MOUTH_QUEST_ID]: FOG_TOOK_QUEST_ID,
};

function questStatus(
  world: WorldState,
  character: Character,
  questId: string,
): "active" | "completed" | undefined {
  return world.quests?.[character.id]?.[questId]?.status;
}

function wrappingSeen(world: WorldState, character: Character): boolean {
  return objectiveDone(world, character, STILL_SLEEPS_ID, "read-wrapping");
}

function objectiveDone(
  world: WorldState,
  character: Character,
  questId: string,
  objectiveId: string,
): boolean {
  return Boolean(
    world.quests?.[character.id]?.[questId]?.completedObjectiveIds.includes(objectiveId),
  );
}

export function meadowRoadOpen(world: WorldState, character: Character): boolean {
  if (!character.schoolId) {
    return false;
  }
  return (
    questStatus(world, character, STILL_SLEEPS_ID) === "completed" &&
    questStatus(world, character, `third-lessons-${character.schoolId}`) === "completed"
  );
}

export function questPrerequisitesMet(
  world: WorldState,
  character: Character,
  requiresQuestIds: readonly string[] | undefined,
): boolean {
  return (requiresQuestIds ?? []).every(
    (questId) => questStatus(world, character, questId) === "completed",
  );
}

export function resolvePiperSpeechNode(
  tree: DialogueTree | undefined,
  world: WorldState,
  character: Character,
): string | undefined {
  if (!tree) {
    return undefined;
  }
  if (questStatus(world, character, STILL_SLEEPS_ID) === "completed" && tree.nodes["after-queen"]) {
    return "after-queen";
  }
  if (wrappingSeen(world, character) && tree.nodes["holm-named"]) {
    return "holm-named";
  }
  return tree.nodes[tree.start] ? tree.start : undefined;
}

export function resolveWrenSpeechNode(
  tree: DialogueTree | undefined,
  world: WorldState,
  character: Character,
): string | undefined {
  if (!tree) {
    return undefined;
  }
  const preferred = wrenSpeechNode(world, character);
  if (tree.nodes[preferred]) {
    return preferred;
  }
  return tree.nodes[tree.start] ? tree.start : undefined;
}

function wrenSpeechNode(world: WorldState, character: Character): string {
  if (questStatus(world, character, FOG_TOOK_QUEST_ID) === "completed") {
    return "stay";
  }
  if (questStatus(world, character, FOG_TOOK_QUEST_ID) === "active") {
    return objectiveDone(world, character, FOG_TOOK_QUEST_ID, "read-colm")
      ? "after-colm"
      : "barrow-done";
  }
  if (questStatus(world, character, BARROW_MOUTH_QUEST_ID) === "completed") {
    return "barrow-done";
  }
  if (questStatus(world, character, STONES_QUEST_ID) === "completed") {
    return "stones-done";
  }
  if (questStatus(world, character, UNCOUNTED_FLOCK_QUEST_ID) === "completed") {
    return "flock-done";
  }
  if (questStatus(world, character, MEADOW_FORK_QUEST_ID) === "completed") {
    return "fork-done";
  }
  return "welcome";
}

export function resolveFenSpeechNode(
  tree: DialogueTree | undefined,
  world: WorldState,
  character: Character,
): string | undefined {
  if (!tree) {
    return undefined;
  }
  const fog = questStatus(world, character, FOG_TOOK_QUEST_ID);
  const wrenTold =
    fog === "completed" || objectiveDone(world, character, FOG_TOOK_QUEST_ID, "tell-wren");
  if (wrenTold && tree.nodes["after-colm"]) {
    return "after-colm";
  }
  return tree.nodes[tree.start] ? tree.start : undefined;
}

export function resolveFlintSpeechNode(
  tree: DialogueTree | undefined,
  world: WorldState,
  character: Character,
): string | undefined {
  if (!tree) {
    return undefined;
  }
  const walker = questStatus(world, character, WALKER_QUEST_ID);
  if (
    (walker === "active" ||
      (questStatus(world, character, FOG_TOOK_QUEST_ID) === "completed" &&
        walker !== "completed")) &&
    tree.nodes["fog-lock"]
  ) {
    return "fog-lock";
  }
  return tree.nodes[tree.start] ? tree.start : undefined;
}

export function resolveTansySpeechNode(
  tree: DialogueTree | undefined,
  world: WorldState,
  character: Character,
): string | undefined {
  if (!tree) {
    return undefined;
  }
  if (questStatus(world, character, STONES_QUEST_ID) === "completed" && tree.nodes["peat-mint"]) {
    return "peat-mint";
  }
  return tree.nodes[tree.start] ? tree.start : undefined;
}

export function resolveQuillSpeechNode(
  tree: DialogueTree | undefined,
  world: WorldState,
  character: Character,
): string | undefined {
  if (!tree) {
    return undefined;
  }
  if (questStatus(world, character, STONES_QUEST_ID) === "completed") {
    const holdsRubbing = itemsHeldBy(world, character.id).some(
      (item) => item.templateId === ABBEY_MARK_RUBBING_TEMPLATE_ID,
    );
    if (holdsRubbing && tree.nodes["abbey-rubbing-kept"]) {
      return "abbey-rubbing-kept";
    }
    if (tree.nodes["abbey-rubbing"]) {
      return "abbey-rubbing";
    }
  }
  return tree.nodes[tree.start] ? tree.start : undefined;
}

export function resolveNamedNpcSpeechNode(
  npc: RoomFixture,
  world: WorldState,
  character: Character,
): string | undefined {
  if (npc.id === PIPER_NPC_ID) {
    return resolvePiperSpeechNode(npc.dialogueTree, world, character);
  }
  if (npc.id === WREN_NPC_ID) {
    return resolveWrenSpeechNode(npc.dialogueTree, world, character);
  }
  if (npc.id === FEN_NPC_ID) {
    return resolveFenSpeechNode(npc.dialogueTree, world, character);
  }
  if (npc.id === FLINT_NPC_ID) {
    return resolveFlintSpeechNode(npc.dialogueTree, world, character);
  }
  if (npc.id === TANSY_NPC_ID) {
    return resolveTansySpeechNode(npc.dialogueTree, world, character);
  }
  if (npc.id === QUILL_NPC_ID) {
    return resolveQuillSpeechNode(npc.dialogueTree, world, character);
  }
  return undefined;
}
