import { type EventEnvelope } from "@greenwood/contracts";
import { progressQuests, startQuest } from "./arrival.js";
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
  const matches = (world.rooms[character.roomId]?.fixtures ?? []).filter(
    (fixture) =>
      fixture.kind === "npc" &&
      fixture.dialogue &&
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
  if (!npc?.dialogue) {
    return {
      ok: false,
      code: "npc_not_found",
      message: `There is nobody called "${intent.target}" to talk to here. Type look to see who is nearby, or say to speak to other Collegians.`,
    };
  }
  const greeting = systemNotice(character.id, `${npc.name}\n\n${npc.dialogue}`, runtime);
  greeting.segments = [
    { kind: "actor", entityKind: "npc", id: npc.id, text: npc.name },
    { kind: "text", text: `\n\n${npc.dialogue}` },
  ];
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
