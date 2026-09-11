import { type EventEnvelope } from "@greenwood/contracts";
import { fixturesVisibleTo } from "./arrival-guide.js";
import { progressQuests, startQuest } from "./arrival.js";
import { formatDialogueNode, startNode } from "./conversation.js";
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
  const spoken = opened
    ? formatDialogueNode(npc.name, opened.node)
    : `${npc.name}\n\n${npc.dialogue ?? ""}`;
  if (opened) {
    character.openConversation = { npcId: npc.id, nodeId: opened.id };
  }
  const greeting = systemNotice(character.id, spoken, runtime);
  if (!opened) {
    greeting.segments = [
      { kind: "actor", entityKind: "npc", id: npc.id, text: npc.name },
      { kind: "text", text: `\n\n${npc.dialogue ?? ""}` },
    ];
  }
  const events: EventEnvelope[] = [greeting];
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
  events.push(
    ...progressQuests(
      world,
      { characterId: character.id, kind: "talk", targetId: npc.id },
      runtime,
    ),
  );
  for (const quest of givenQuests) {
    if (!started.has(quest.id) && world.quests?.[character.id]?.[quest.id]?.status === "active") {
      events.push(systemNotice(character.id, quest.reminderNarration, runtime));
    }
  }
  return { ok: true, npcId: npc.id, events };
}
