import type { EventEnvelope } from "@greenwood/contracts";
import type { EngineRuntime, QuestsIntent, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export type QuestsSuccess = {
  ok: true;
  event: EventEnvelope;
};

export type QuestsFailure = {
  ok: false;
  code: "character_not_found";
  message: string;
};

export type QuestsResult = QuestsSuccess | QuestsFailure;

export function handleQuests(
  world: WorldState,
  intent: QuestsIntent,
  runtime: EngineRuntime,
): QuestsResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }

  const started = Object.values(world.questTemplates ?? {}).some(
    (template) => world.quests?.[character.id]?.[template.id],
  );
  const narration = started ? "You review your tasks." : "You have no tasks yet.";
  return {
    ok: true,
    event: { ...systemNotice(character.id, narration, runtime), presentationKey: "quest.journal" },
  };
}
