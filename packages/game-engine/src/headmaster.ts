import type { EventEnvelope } from "@greenwood/contracts";
import { handleLook } from "./look.js";
import type { Character, EngineRuntime, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export const HEADMASTER_NPC_ID = "npc-headmaster-alder";
export const HEADMASTER_STUDY_ID = "headmaster-study";

export function alderSpeechNode(character: Character): string {
  return character.schoolId ? "already-chosen" : "welcome";
}

export function openAlderStudy(world: WorldState, character: Character): void {
  const alder = world.rooms[HEADMASTER_STUDY_ID]?.fixtures.find(
    (fixture) => fixture.id === HEADMASTER_NPC_ID,
  );
  if (!alder?.dialogueTree?.nodes[alderSpeechNode(character)]) {
    return;
  }
  character.openConversation = { npcId: alder.id, nodeId: alderSpeechNode(character) };
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
