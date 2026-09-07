import type { EventEnvelope } from "@greenwood/contracts";
import { findHelpEntry, formatHelpList } from "./help-catalog.js";
import type { EngineRuntime, HelpIntent, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export type HelpSuccess = {
  ok: true;
  event: EventEnvelope;
};

export type HelpFailure = {
  ok: false;
  code: "character_not_found";
  message: string;
};

export type HelpResult = HelpSuccess | HelpFailure;

export function handleHelp(
  world: WorldState,
  intent: HelpIntent,
  runtime: EngineRuntime,
): HelpResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }

  const topic = intent.topic?.trim() ?? "";
  if (topic.length === 0) {
    return { ok: true, event: systemNotice(character.id, formatHelpList(), runtime) };
  }
  const entry = findHelpEntry(topic);
  if (!entry) {
    return {
      ok: true,
      event: systemNotice(
        character.id,
        `I do not have help for ${topic}. Type help for a list of words the Collegium understands.`,
        runtime,
      ),
    };
  }
  return {
    ok: true,
    event: systemNotice(character.id, `${entry.topic}: ${entry.detail}`, runtime),
  };
}
