import {
  experienceGainedEventSchema,
  formatExperienceGainedText,
  formatLevelGainedText,
  formatQuestUpdatedText,
  levelGainedEventSchema,
  questUpdatedEventSchema,
  schemaVersion,
  type EventEnvelope,
} from "@greenwood/contracts";
import { itemsHeldBy } from "./items.js";
import { levelForExperience } from "./progression.js";
import type {
  Character,
  EngineRuntime,
  QuestObjective,
  QuestProgress,
  QuestTemplate,
  WorldState,
} from "./state.js";
import { systemNotice } from "./system-notice.js";

export const ARRIVAL_QUEST_ID = "arrival-at-the-collegium";

export type QuestTriggerKind = "look" | "say" | "take" | "move" | "examine" | "talk";

export type QuestTrigger = {
  characterId: string;
  kind: QuestTriggerKind;
  targetId?: string;
};

export type QuestProgressRecord = {
  characterId: string;
  questId: string;
  status: "active" | "completed";
  completedObjectiveIds: string[];
  rewardGranted: boolean;
};

export function applyQuestProgress(
  world: WorldState,
  characterId: string,
  records: readonly QuestProgressRecord[],
): void {
  const byCharacter = worldQuests(world);
  const progress: Record<string, QuestProgress> = {};
  for (const record of records) {
    progress[record.questId] = {
      questId: record.questId,
      status: record.status,
      completedObjectiveIds: [...record.completedObjectiveIds],
      rewardGranted: record.rewardGranted,
    };
  }
  byCharacter[characterId] = progress;
}

export function listQuestRecords(world: WorldState, characterId: string): QuestProgressRecord[] {
  return Object.values(world.quests?.[characterId] ?? {}).map((progress) => ({
    characterId,
    questId: progress.questId,
    status: progress.status,
    completedObjectiveIds: [...progress.completedObjectiveIds],
    rewardGranted: progress.rewardGranted,
  }));
}

export function startArrivalQuest(
  world: WorldState,
  characterId: string,
  runtime: EngineRuntime,
): EventEnvelope[] {
  return startQuest(world, characterId, ARRIVAL_QUEST_ID, runtime);
}

export function startQuest(
  world: WorldState,
  characterId: string,
  questId: string,
  runtime: EngineRuntime,
): EventEnvelope[] {
  const template = world.questTemplates?.[questId];
  if (!template) {
    return [];
  }
  const existing = characterQuest(world, characterId, template.id);
  if (existing?.status === "completed") {
    return [];
  }
  if (existing?.status === "active") {
    return [systemNotice(characterId, template.reminderNarration, runtime)];
  }
  writeProgress(world, characterId, {
    questId: template.id,
    status: "active",
    completedObjectiveIds: [],
    rewardGranted: false,
  });
  return [
    systemNotice(characterId, template.introNarration, runtime),
    questUpdatedEvent(
      characterId,
      template,
      characterQuest(world, characterId, template.id),
      runtime,
    ),
  ];
}

export function progressQuests(
  world: WorldState,
  trigger: QuestTrigger,
  runtime: EngineRuntime,
): EventEnvelope[] {
  const character = world.characters[trigger.characterId];
  if (!character) {
    return [];
  }
  const events: EventEnvelope[] = [];
  for (const template of Object.values(world.questTemplates ?? {})) {
    const progress = characterQuest(world, character.id, template.id);
    if (!progress || progress.status !== "active" || progress.rewardGranted) {
      continue;
    }
    const newlyCompleted = template.objectives.filter(
      (objective) =>
        !progress.completedObjectiveIds.includes(objective.id) &&
        (objective.requires ?? []).every((id) => progress.completedObjectiveIds.includes(id)) &&
        objectiveMatches(world, character, objective, trigger),
    );
    if (newlyCompleted.length === 0) {
      continue;
    }
    progress.completedObjectiveIds.push(...newlyCompleted.map((objective) => objective.id));
    const remaining = remainingObjectives(template, progress);
    if (remaining.length === 0) {
      progress.status = "completed";
      events.push(questUpdatedEvent(character.id, template, progress, runtime));
      events.push(...awardQuestReward(character, template, progress, runtime));
    } else {
      events.push(questUpdatedEvent(character.id, template, progress, runtime));
    }
  }
  return events;
}

function awardQuestReward(
  character: Character,
  template: QuestTemplate,
  progress: QuestProgress,
  runtime: EngineRuntime,
): EventEnvelope[] {
  if (progress.rewardGranted) {
    return [];
  }
  progress.rewardGranted = true;
  const previousLevel = character.level ?? levelForExperience(character.experience ?? 0);
  character.experience = (character.experience ?? 0) + template.experienceReward;
  const nextLevel = levelForExperience(character.experience);
  character.level = nextLevel;
  const events: EventEnvelope[] = [experienceEvent(character, template.experienceReward, runtime)];
  if (nextLevel > previousLevel) {
    events.push(levelEvent(character, runtime));
  }
  return events;
}

function objectiveMatches(
  world: WorldState,
  character: Character,
  objective: QuestObjective,
  trigger: QuestTrigger,
): boolean {
  const { kind } = trigger;
  if (objective.roomId && character.roomId !== objective.roomId) return false;
  if (objective.kind === "examine" || objective.kind === "talk") {
    return (
      kind === objective.kind &&
      Boolean(objective.targetId) &&
      trigger.targetId === objective.targetId
    );
  }
  if (objective.kind === "look") {
    return kind === "look";
  }
  if (objective.kind === "say") {
    return kind === "say";
  }
  if (objective.kind === "take") {
    return (
      kind === "take" &&
      itemsHeldBy(world, character.id).some((item) => item.templateId === objective.itemTemplateId)
    );
  }
  return kind === "move" && Boolean(objective.roomId) && character.roomId === objective.roomId;
}

function questUpdatedEvent(
  characterId: string,
  template: QuestTemplate,
  progress: QuestProgress | undefined,
  runtime: EngineRuntime,
): EventEnvelope {
  const completedIds = progress?.completedObjectiveIds ?? [];
  const payload = {
    characterId,
    questId: template.id,
    title: template.title,
    status: progress?.status ?? "active",
    completedObjectives: completedIds
      .map((id) => template.objectives.find((objective) => objective.id === id)?.label)
      .filter((label): label is string => Boolean(label)),
    remainingObjectives: remainingObjectives(
      template,
      progress ?? {
        questId: template.id,
        status: "active",
        completedObjectiveIds: [],
        rewardGranted: false,
      },
    ).map((objective) => objective.label),
  };
  return questUpdatedEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(characterId),
    schemaVersion,
    type: "quest.updated",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    narration: [
      formatQuestUpdatedText(payload),
      ...(progress?.status === "completed" && template.completionNarration
        ? [template.completionNarration]
        : []),
    ].join("\n\n"),
    payload,
  });
}

function remainingObjectives(template: QuestTemplate, progress: QuestProgress): QuestObjective[] {
  return template.objectives.filter(
    (objective) => !progress.completedObjectiveIds.includes(objective.id),
  );
}

function experienceEvent(
  character: Character,
  amount: number,
  runtime: EngineRuntime,
): EventEnvelope {
  const payload = {
    characterId: character.id,
    amount,
    total: character.experience ?? amount,
  };
  return experienceGainedEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(character.id),
    schemaVersion,
    type: "progress.experience_gained",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    narration: formatExperienceGainedText(payload),
    payload,
  });
}

function levelEvent(character: Character, runtime: EngineRuntime): EventEnvelope {
  const payload = {
    characterId: character.id,
    level: character.level ?? 1,
    experience: character.experience ?? 0,
  };
  return levelGainedEventSchema.parse({
    eventId: runtime.nextEventId(),
    sequence: runtime.nextSequence(character.id),
    schemaVersion,
    type: "progress.level_gained",
    occurredAt: runtime.now().toISOString(),
    audience: "character",
    narration: formatLevelGainedText(payload),
    payload,
  });
}

function worldQuests(world: WorldState): Record<string, Record<string, QuestProgress>> {
  if (!world.quests) {
    world.quests = {};
  }
  return world.quests;
}

function characterQuest(
  world: WorldState,
  characterId: string,
  questId: string,
): QuestProgress | undefined {
  return world.quests?.[characterId]?.[questId];
}

function writeProgress(world: WorldState, characterId: string, progress: QuestProgress): void {
  const byCharacter = worldQuests(world);
  const current = byCharacter[characterId] ?? {};
  current[progress.questId] = progress;
  byCharacter[characterId] = current;
}
