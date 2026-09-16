import type { EventEnvelope } from "@greenwood/contracts";
import { handleLook } from "./look.js";
import type { Character, DialogueTree, EngineRuntime, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export const HEADMASTER_NPC_ID = "npc-headmaster-alder";
export const HEADMASTER_STUDY_ID = "headmaster-study";
export const BELL_BELOW_QUEST_ID = "the-bell-below";
export const BELL_WAKES_QUEST_ID = "the-bell-wakes";

export function firstLessonsComplete(world: WorldState, character: Character): boolean {
  if (!character.schoolId) {
    return false;
  }
  return (
    world.quests?.[character.id]?.[`first-lessons-${character.schoolId}`]?.status === "completed"
  );
}

export function alderSpeechNode(world: WorldState, character: Character): string {
  if (!character.schoolId) {
    return "welcome";
  }
  const bell = world.quests?.[character.id]?.[BELL_BELOW_QUEST_ID];
  const wakes = world.quests?.[character.id]?.[BELL_WAKES_QUEST_ID];
  if (bell?.status === "completed") {
    if (wakes?.status === "completed") {
      return "wakes-done";
    }
    if (wakes?.status === "active") {
      return "wakes-active";
    }
    return "offer-wakes";
  }
  if (bell?.status === "active") {
    return "bell-active";
  }
  if (firstLessonsComplete(world, character)) {
    return "offer-bell";
  }
  return "already-chosen";
}

export function resolveAlderSpeechNode(
  tree: DialogueTree | undefined,
  world: WorldState,
  character: Character,
): string | undefined {
  if (!tree) {
    return undefined;
  }
  const preferred = alderSpeechNode(world, character);
  if (tree.nodes[preferred]) {
    return preferred;
  }
  if (character.schoolId && tree.nodes["already-chosen"]) {
    return "already-chosen";
  }
  if (tree.nodes[tree.start]) {
    return tree.start;
  }
  return undefined;
}

export function openAlderStudy(world: WorldState, character: Character): void {
  const alder = world.rooms[HEADMASTER_STUDY_ID]?.fixtures.find(
    (fixture) => fixture.id === HEADMASTER_NPC_ID,
  );
  const nodeId = resolveAlderSpeechNode(alder?.dialogueTree, world, character);
  if (!alder || !nodeId) {
    return;
  }
  character.openConversation = { npcId: alder.id, nodeId };
}

export function summonToHeadmaster(
  world: WorldState,
  character: Character,
  runtime: EngineRuntime,
): EventEnvelope[] {
  const study = world.rooms[HEADMASTER_STUDY_ID];
  if (!study) {
    return [];
  }
  const events: EventEnvelope[] = [];
  if (character.roomId !== study.id) {
    character.roomId = study.id;
    if (!character.discoveredRoomIds.includes(study.id)) {
      character.discoveredRoomIds.push(study.id);
    }
    events.push(
      systemNotice(
        character.id,
        "Alder does not wait in the hall. The Great Hall folds away. You stand in the High Study.",
        runtime,
      ),
    );
    const look = handleLook(world, { verb: "look", characterId: character.id }, runtime);
    if (look.ok) {
      events.push(look.event);
    }
  }
  openAlderStudy(world, character);
  events.push(systemNotice(character.id, "Headmaster Alder speaks with you.", runtime));
  return events;
}
