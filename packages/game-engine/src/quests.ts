import type { EventEnvelope } from "@greenwood/contracts";
import type {
  EngineRuntime,
  QuestProgress,
  QuestsIntent,
  QuestTemplate,
  WorldState,
} from "./state.js";
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

  const lines: string[] = [];
  for (const template of Object.values(world.questTemplates ?? {})) {
    const progress = world.quests?.[character.id]?.[template.id];
    if (!progress) {
      continue;
    }
    lines.push(formatQuestStatus(template, progress));
  }
  const narration =
    lines.length === 0 ? "You have no tasks yet." : ["Your tasks:", ...lines].join("\n");
  return {
    ok: true,
    event: { ...systemNotice(character.id, narration, runtime), presentationKey: "quest.journal" },
  };
}

function formatQuestStatus(template: QuestTemplate, progress: QuestProgress): string {
  const remaining = template.objectives.filter(
    (objective) => !progress.completedObjectiveIds.includes(objective.id),
  );
  const done = template.objectives.filter((objective) =>
    progress.completedObjectiveIds.includes(objective.id),
  );
  if (progress.status === "completed") {
    return `  ${template.title} (completed)`;
  }
  const still = remaining.map((objective) => objective.label).join("; ");
  const finished =
    done.length === 0 ? "nothing yet" : done.map((objective) => objective.label).join("; ");
  return `  ${template.title} (active)\n    Done: ${finished}\n    Still to do: ${still}`;
}
