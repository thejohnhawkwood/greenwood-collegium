import type { EventEnvelope } from "@greenwood/contracts";
import type { EngineRuntime, QuestsIntent, WorldState } from "./state.js";
import { defenseFighting, minutesLeft } from "./college-defense.js";
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
  // H3. While the yard is held, the gates and the clock sit above the errands.
  const now = runtime.now();
  const defenseLine = defenseFighting(world, now)
    ? [
        `The college is being defended. About ${String(Math.max(1, minutesLeft(world.defense, now)))} minutes left.`,
        "Gates: Lantern Court, the East Meadow, the South Orchard.",
        "",
      ].join("\n")
    : undefined;
  const narration = [defenseLine, started ? "You review your tasks." : "You have no tasks yet."]
    .filter((line): line is string => Boolean(line))
    .join("\n");
  return {
    ok: true,
    event: { ...systemNotice(character.id, narration, runtime), presentationKey: "quest.journal" },
  };
}
