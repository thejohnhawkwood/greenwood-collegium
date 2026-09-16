import { type EventEnvelope } from "@greenwood/contracts";
import { fixturesVisibleTo } from "./arrival-guide.js";
import { progressQuests, startQuest } from "./arrival.js";
import { dialogueBeat, startNode } from "./conversation.js";
import {
  BELL_BELOW_QUEST_ID,
  firstLessonsComplete,
  HEADMASTER_NPC_ID,
  resolveAlderSpeechNode,
} from "./headmaster.js";
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
  const alderNode =
    npc.id === HEADMASTER_NPC_ID
      ? resolveAlderSpeechNode(npc.dialogueTree, world, character)
      : opened?.id;
  character.openConversation = alderNode ? { npcId: npc.id, nodeId: alderNode } : { npcId: npc.id };
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
  events.push(
    ...progressQuests(
      world,
      { characterId: character.id, kind: "talk", targetId: npc.id },
      runtime,
    ),
  );
  if (
    npc.id === HEADMASTER_NPC_ID &&
    world.quests?.[character.id]?.[BELL_BELOW_QUEST_ID]?.status === "completed"
  ) {
    const nextNode = resolveAlderSpeechNode(npc.dialogueTree, world, character);
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
  return { ok: true, npcId: npc.id, events };
}
