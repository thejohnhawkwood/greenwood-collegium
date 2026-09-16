import type { EventEnvelope } from "@greenwood/contracts";
import { progressQuests, startQuest } from "./arrival.js";
import { firstLessonsComplete } from "./headmaster.js";
import { handleLook } from "./look.js";
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

export function isSchoolId(value: string | undefined): value is SchoolId {
  return Boolean(value && (SCHOOL_IDS as readonly string[]).includes(value));
}

export function schoolGift(world: WorldState, character: Character): SpellTemplate | undefined {
  return schoolKit(world, character)[0];
}

export function schoolKit(world: WorldState, character: Character): SpellTemplate[] {
  if (!character.schoolId || (character.level ?? 1) < 3) {
    return [];
  }
  return SCHOOL_KIT_IDS[character.schoolId].flatMap((id) => {
    const spell = world.spells?.[id];
    return spell ? [spell] : [];
  });
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
  return [systemNotice(character.id, `Your School kit opens. Type ${help}.`, runtime)];
}

export const MENTOR_DONE_NODE = "lessons-done";

export function resolveMentorSpeechNode(
  world: WorldState,
  character: Character,
  npc: RoomFixture,
): string | undefined {
  const tree = npc.dialogueTree;
  if (!tree) {
    return undefined;
  }
  const isMentor = SCHOOL_IDS.some((school) => SCHOOL_MENTOR_ID[school] === npc.id);
  if (isMentor && firstLessonsComplete(world, character) && tree.nodes[MENTOR_DONE_NODE]) {
    return MENTOR_DONE_NODE;
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
