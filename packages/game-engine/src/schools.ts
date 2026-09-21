import type { EventEnvelope } from "@greenwood/contracts";
import { progressQuests, startQuest } from "./arrival.js";
import { firstLessonsComplete } from "./headmaster.js";
import { handleLook } from "./look.js";
import { inkedSpellTemplates } from "./primer.js";
import type {
  Character,
  EngineRuntime,
  RoomFixture,
  SchoolId,
  SpellTemplate,
  WorldState,
} from "./state.js";
import { systemNotice } from "./system-notice.js";

export const SCHOOL_IDS = ["ember", "thorn", "veil", "stars", "stone", "steel"] as const;

export const SCHOOL_TITLE: Record<SchoolId, string> = {
  ember: "Ember",
  thorn: "Thorns",
  veil: "the Veil",
  stars: "Stars",
  stone: "Stone",
  steel: "Steel",
};

export const SCHOOL_HEARTH_ID: Record<SchoolId, string> = {
  ember: "hearth-ember",
  thorn: "hearth-thorn",
  veil: "hearth-veil",
  stars: "hearth-stars",
  stone: "hearth-stone",
  steel: "hearth-steel",
};

export const SCHOOL_MENTOR_ID: Record<SchoolId, string> = {
  ember: "npc-mentor-cinder",
  thorn: "npc-mentor-briar",
  veil: "npc-mentor-mist",
  stars: "npc-mentor-lumen",
  stone: "npc-mentor-quern",
  steel: "npc-mentor-edge",
};

export const SCHOOL_GIFT_ID: Record<SchoolId, string> = {
  ember: "ember",
  thorn: "briar",
  veil: "shade",
  stars: "azimuth",
  stone: "keystone",
  steel: "strike",
};

export const SCHOOL_KIT_IDS: Record<SchoolId, readonly [string, string, string]> = {
  ember: ["ember", "cinder-snap", "hearth-ward"],
  thorn: ["briar", "bind", "greenstitch"],
  veil: ["shade", "slip", "quiet-step"],
  stars: ["azimuth", "flare", "night-eye"],
  stone: ["keystone", "stomp", "brace"],
  steel: ["strike", "riposte", "ready-steel"],
};

export const SCHOOL_FIRST_LESSONS_ID: Record<SchoolId, string> = {
  ember: "first-lessons-ember",
  thorn: "first-lessons-thorn",
  veil: "first-lessons-veil",
  stars: "first-lessons-stars",
  stone: "first-lessons-stone",
  steel: "first-lessons-steel",
};

export const SCHOOL_SECOND_LESSONS_ID: Record<SchoolId, string> = {
  ember: "second-lessons-ember",
  thorn: "second-lessons-thorn",
  veil: "second-lessons-veil",
  stars: "second-lessons-stars",
  stone: "second-lessons-stone",
  steel: "second-lessons-steel",
};

export const SCHOOL_THIRD_LESSONS_ID: Record<SchoolId, string> = {
  ember: "third-lessons-ember",
  thorn: "third-lessons-thorn",
  veil: "third-lessons-veil",
  stars: "third-lessons-stars",
  stone: "third-lessons-stone",
  steel: "third-lessons-steel",
};

export const SCHOOL_HEARTH_DUMMY_ID: Record<SchoolId, string> = {
  ember: "enemy-practice-dummy-hearth-ember",
  thorn: "enemy-practice-dummy-hearth-thorn",
  veil: "enemy-practice-dummy-hearth-veil",
  stars: "enemy-practice-dummy-hearth-stars",
  stone: "enemy-practice-dummy-hearth-stone",
  steel: "enemy-practice-dummy-hearth-steel",
};

export function isSchoolId(value: string | undefined): value is SchoolId {
  return Boolean(value && (SCHOOL_IDS as readonly string[]).includes(value));
}

export function schoolGift(world: WorldState, character: Character): SpellTemplate | undefined {
  return schoolKit(world, character)[0];
}

export function schoolKit(world: WorldState, character: Character): SpellTemplate[] {
  return inkedSpellTemplates(world, character);
}

export function openSchoolGift(
  world: WorldState,
  character: Character,
  runtime: EngineRuntime,
): EventEnvelope[] {
  const kit = schoolKit(world, character);
  if (!kit.length) {
    return [];
  }
  const help = kit.map((spell) => spell.helpText).join(", ");
  return [systemNotice(character.id, `Your Primer leaves are inked. Type ${help}.`, runtime)];
}

export const MENTOR_DONE_NODE = "lessons-done";

function questStatus(
  world: WorldState,
  character: Character,
  questId: string,
): "active" | "completed" | undefined {
  return world.quests?.[character.id]?.[questId]?.status;
}

export function resolveMentorSpeechNode(
  world: WorldState,
  character: Character,
  npc: RoomFixture,
): string | undefined {
  const tree = npc.dialogueTree;
  if (!tree) {
    return undefined;
  }
  const school = SCHOOL_IDS.find((id) => SCHOOL_MENTOR_ID[id] === npc.id);
  if (school) {
    if (questStatus(world, character, SCHOOL_THIRD_LESSONS_ID[school]) === "completed") {
      return tree.nodes["third-done"] ? "third-done" : MENTOR_DONE_NODE;
    }
    if (questStatus(world, character, SCHOOL_SECOND_LESSONS_ID[school]) === "completed") {
      return tree.nodes["third-lesson"] ? "third-lesson" : MENTOR_DONE_NODE;
    }
    if (firstLessonsComplete(world, character) && tree.nodes[MENTOR_DONE_NODE]) {
      return MENTOR_DONE_NODE;
    }
  }
  return tree.nodes[tree.start] ? tree.start : undefined;
}

export function openSchoolMentor(world: WorldState, character: Character): void {
  if (!character.schoolId) {
    return;
  }
  const mentorId = SCHOOL_MENTOR_ID[character.schoolId];
  const hearth = world.rooms[SCHOOL_HEARTH_ID[character.schoolId]];
  const mentor = hearth?.fixtures.find((fixture) => fixture.id === mentorId);
  if (!mentor?.dialogueTree?.nodes[mentor.dialogueTree.start]) {
    return;
  }
  character.openConversation = { npcId: mentor.id, nodeId: mentor.dialogueTree.start };
}

export function sendToSchoolHearth(
  world: WorldState,
  character: Character,
  runtime: EngineRuntime,
): EventEnvelope[] {
  if (!character.schoolId) {
    return [];
  }
  const hearth = world.rooms[SCHOOL_HEARTH_ID[character.schoolId]];
  if (!hearth) {
    return [];
  }
  const events: EventEnvelope[] = [];
  if (character.roomId !== hearth.id) {
    character.roomId = hearth.id;
    if (!character.discoveredRoomIds.includes(hearth.id)) {
      character.discoveredRoomIds.push(hearth.id);
    }
    events.push(
      systemNotice(
        character.id,
        `The High Study folds away. You stand in the ${hearth.title}.`,
        runtime,
      ),
    );
  }
  events.push(
    ...startQuest(world, character.id, SCHOOL_FIRST_LESSONS_ID[character.schoolId], runtime),
  );
  const look = handleLook(world, { verb: "look", characterId: character.id }, runtime);
  if (look.ok) {
    events.push(look.event);
  }
  events.push(...progressQuests(world, { characterId: character.id, kind: "look" }, runtime));
  openSchoolMentor(world, character);
  const mentor = hearth.fixtures.find(
    (fixture) => fixture.id === SCHOOL_MENTOR_ID[character.schoolId!],
  );
  if (mentor) {
    events.push(systemNotice(character.id, `${mentor.name} speaks with you.`, runtime));
  }
  return events;
}
