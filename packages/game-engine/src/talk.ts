import { type EventEnvelope } from "@greenwood/contracts";
import { fixturesVisibleTo } from "./arrival-guide.js";
import { progressQuests, startQuest } from "./arrival.js";
import { dialogueBeat, startNode } from "./conversation.js";
import {
  BELL_BELOW_QUEST_ID,
  BELL_WAKES_QUEST_ID,
  firstLessonsComplete,
  HEADMASTER_NPC_ID,
  resolveAlderSpeechNode,
  STILL_SLEEPS_QUEST_ID,
} from "./headmaster.js";
import { resolveMentorSpeechNode } from "./schools.js";
import { namesMatch } from "./names.js";
import type { EngineRuntime, TalkIntent, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export type TalkResult =
  | { ok: true; npcId: string; events: EventEnvelope[] }
  | { ok: false; code: "character_not_found" | "npc_not_found" | "npc_ambiguous"; message: string };

/** Authored conversation is private to the speaking Collegian. */
export function handleTalk(
  world: WorldState,
  intent: TalkIntent,
  runtime: EngineRuntime,
): TalkResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: "Your character is not in the realm.",
    };
  }
  const matches = fixturesVisibleTo(world, character).filter(
    (fixture) =>
      fixture.kind === "npc" &&
      (fixture.dialogue || fixture.dialogueTree) &&
      namesMatch(fixture.name, fixture.id, intent.target),
  );
  if (matches.length > 1) {
    return {
      ok: false,
      code: "npc_ambiguous",
      message: `Who did you mean: ${matches.map((npc) => npc.name).join(", ")}?`,
    };
  }
  const npc = matches[0];
  if (!npc || (!npc.dialogue && !npc.dialogueTree)) {
    return {
      ok: false,
      code: "npc_not_found",
      message: `There is nobody called "${intent.target}" to talk to here. Type look to see who is nearby, or say to speak to other Collegians.`,
    };
  }
  const opened = npc.dialogueTree ? startNode(npc.dialogueTree) : undefined;
  const speechNode =
    npc.id === HEADMASTER_NPC_ID
      ? resolveAlderSpeechNode(npc.dialogueTree, world, character)
      : (resolveMentorSpeechNode(world, character, npc) ?? opened?.id);
  character.openConversation = speechNode
    ? { npcId: npc.id, nodeId: speechNode }
    : { npcId: npc.id };
  const events: EventEnvelope[] = [systemNotice(character.id, dialogueBeat(npc.name), runtime)];
  const givenQuests = Object.values(world.questTemplates ?? {}).filter(
    (quest) => quest.giverNpcId === npc.id,
  );
  const started = new Set<string>();
  for (const quest of givenQuests) {
    if (!world.quests?.[character.id]?.[quest.id]) {
      events.push(...startQuest(world, character.id, quest.id, runtime));
      started.add(quest.id);
    }
  }
  const offerBell =
    npc.id === HEADMASTER_NPC_ID &&
    firstLessonsComplete(world, character) &&
    !world.quests?.[character.id]?.[BELL_BELOW_QUEST_ID];
  if (offerBell) {
    events.push(...startQuest(world, character.id, BELL_BELOW_QUEST_ID, runtime));
    started.add(BELL_BELOW_QUEST_ID);
  }
  const offerWakes =
    npc.id === HEADMASTER_NPC_ID &&
    world.quests?.[character.id]?.[BELL_BELOW_QUEST_ID]?.status === "completed" &&
    !world.quests?.[character.id]?.[BELL_WAKES_QUEST_ID];
  if (offerWakes) {
    events.push(...startQuest(world, character.id, BELL_WAKES_QUEST_ID, runtime));
    started.add(BELL_WAKES_QUEST_ID);
  }
  const offerSleeps =
    npc.id === HEADMASTER_NPC_ID &&
    world.quests?.[character.id]?.[BELL_WAKES_QUEST_ID]?.status === "completed" &&
    !world.quests?.[character.id]?.[STILL_SLEEPS_QUEST_ID];
  if (offerSleeps) {
    events.push(...startQuest(world, character.id, STILL_SLEEPS_QUEST_ID, runtime));
    started.add(STILL_SLEEPS_QUEST_ID);
  }
  events.push(
    ...progressQuests(
      world,
      { characterId: character.id, kind: "talk", targetId: npc.id },
      runtime,
    ),
  );
  const wakesNow = world.quests?.[character.id]?.[BELL_WAKES_QUEST_ID];
  const sleepsNow = world.quests?.[character.id]?.[STILL_SLEEPS_QUEST_ID];
  const bellDone = world.quests?.[character.id]?.[BELL_BELOW_QUEST_ID]?.status === "completed";
  if (
    npc.id === HEADMASTER_NPC_ID &&
    (sleepsNow?.status === "completed" ||
      (wakesNow?.status === "completed" && !sleepsNow) ||
      (bellDone && !wakesNow))
  ) {
    const nextNode = resolveAlderSpeechNode(npc.dialogueTree, world, character);
    if (nextNode) {
      character.openConversation = { npcId: npc.id, nodeId: nextNode };
    }
  } else if (npc.id !== HEADMASTER_NPC_ID) {
    const nextNode = resolveMentorSpeechNode(world, character, npc);
    if (nextNode) {
      character.openConversation = { npcId: npc.id, nodeId: nextNode };
    }
  }
  for (const quest of givenQuests) {
    if (!started.has(quest.id) && world.quests?.[character.id]?.[quest.id]?.status === "active") {
      events.push(systemNotice(character.id, quest.reminderNarration, runtime));
    }
  }
  const bell = world.quests?.[character.id]?.[BELL_BELOW_QUEST_ID];
  const bellTemplate = world.questTemplates?.[BELL_BELOW_QUEST_ID];
  if (npc.id === HEADMASTER_NPC_ID && !offerBell && bell?.status === "active" && bellTemplate) {
    events.push(systemNotice(character.id, bellTemplate.reminderNarration, runtime));
  }
  const wakes = world.quests?.[character.id]?.[BELL_WAKES_QUEST_ID];
  const wakesTemplate = world.questTemplates?.[BELL_WAKES_QUEST_ID];
  if (npc.id === HEADMASTER_NPC_ID && !offerWakes && wakes?.status === "active" && wakesTemplate) {
    events.push(systemNotice(character.id, wakesTemplate.reminderNarration, runtime));
  }
  const sleeps = world.quests?.[character.id]?.[STILL_SLEEPS_QUEST_ID];
  const sleepsTemplate = world.questTemplates?.[STILL_SLEEPS_QUEST_ID];
  if (
    npc.id === HEADMASTER_NPC_ID &&
    !offerSleeps &&
    sleeps?.status === "active" &&
    sleepsTemplate
  ) {
    events.push(systemNotice(character.id, sleepsTemplate.reminderNarration, runtime));
  }
  return { ok: true, npcId: npc.id, events };
}
