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
import { ARRIVAL_QUEST_ID, openPorterArrival } from "./arrival-guide.js";
import {
  BELL_BELOW_QUEST_ID,
  HEADMASTER_NPC_ID,
  STILL_SLEEPS_QUEST_ID,
  summonToHeadmaster,
} from "./headmaster.js";
import { applyLevelVitals } from "./combat-state.js";
import { hasDefeatedSpawn } from "./enemies.js";
import { itemsHeldBy, worldItems } from "./items.js";
import { grantPrimerInk, maybeOpenWorldPrimer } from "./primer-book.js";
import { openSchoolLeaf } from "./primer.js";
import { levelForExperience } from "./progression.js";
import {
  SCHOOL_SECOND_LESSONS_ID,
  SCHOOL_THIRD_LESSONS_ID,
  SCHOOL_TITLE,
  isSchoolId,
} from "./schools.js";
import { WREN_CHAIN_NEXT } from "./east-watch.js";
import { wearsTemplate } from "./worn-world.js";
import type {
  Character,
  EngineRuntime,
  QuestObjective,
  QuestOutcome,
  QuestProgress,
  QuestTemplate,
  WorldState,
} from "./state.js";
import { systemNotice } from "./system-notice.js";

export { ARRIVAL_QUEST_ID } from "./arrival-guide.js";

export type QuestTriggerKind =
  "look" | "say" | "take" | "move" | "examine" | "talk" | "defeat" | "cast" | "equip";

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
  outcome?: string;
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
      outcome: record.outcome,
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
    outcome: progress.outcome,
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
    openArrivalSpeech(world, characterId, template.id, true);
    return [systemNotice(characterId, template.reminderNarration, runtime)];
  }
  writeProgress(world, characterId, {
    questId: template.id,
    status: "active",
    completedObjectiveIds: [],
    rewardGranted: false,
  });
  openArrivalSpeech(world, characterId, template.id, false);
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

function openArrivalSpeech(
  world: WorldState,
  characterId: string,
  questId: string,
  reminding: boolean,
): void {
  if (questId !== ARRIVAL_QUEST_ID) {
    return;
  }
  const character = world.characters[characterId];
  if (character) {
    openPorterArrival(world, character, reminding);
  }
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
        objectiveMatches(world, character, template, objective, trigger),
    );
    if (newlyCompleted.length > 0) {
      progress.completedObjectiveIds.push(...newlyCompleted.map((objective) => objective.id));
    }
    const alreadyBeaten = template.objectives.filter(
      (objective) =>
        objective.kind === "defeat" &&
        Boolean(objective.targetId) &&
        hasDefeatedSpawn(character, objective.targetId ?? "") &&
        !progress.completedObjectiveIds.includes(objective.id) &&
        (objective.requires ?? []).every((id) => progress.completedObjectiveIds.includes(id)),
    );
    if (newlyCompleted.length === 0 && alreadyBeaten.length === 0) {
      continue;
    }
    progress.completedObjectiveIds.push(...alreadyBeaten.map((objective) => objective.id));
    progress.outcome ??= reachedOutcome(template, progress);
    const remaining = remainingObjectives(template, progress);
    if (remaining.length === 0) {
      progress.status = "completed";
      events.push(questUpdatedEvent(character.id, template, progress, runtime));
      events.push(...awardQuestReward(world, character, template, progress, runtime));
      if (template.id === ARRIVAL_QUEST_ID) {
        events.push(...summonToHeadmaster(world, character, runtime));
      }
      if (template.id.startsWith("first-lessons-")) {
        const school = template.id.slice("first-lessons-".length);
        if (isSchoolId(school)) {
          const inked = openSchoolLeaf(character, school);
          const spell = inked ? world.spells?.[inked.spellId] : undefined;
          events.push(
            systemNotice(
              character.id,
              spell
                ? `Your Primer opens the ${SCHOOL_TITLE[school]} leaf and inks ${spell.name}. Type ${spell.helpText}.`
                : "Your Primer opens a new leaf.",
              runtime,
            ),
          );
          if (school === character.schoolId) {
            events.push(
              ...startQuest(world, character.id, SCHOOL_SECOND_LESSONS_ID[school], runtime),
            );
            events.push(...startQuest(world, character.id, BELL_BELOW_QUEST_ID, runtime));
            events.push(
              systemNotice(
                character.id,
                "Alder will see you in the High Study. Type up from the Great Hall.",
                runtime,
              ),
            );
          }
        }
      }
      if (template.id.startsWith("second-lessons-") && character.schoolId) {
        events.push(...grantPrimerInk(character, 4, runtime));
        events.push(
          ...startQuest(world, character.id, SCHOOL_THIRD_LESSONS_ID[character.schoolId], runtime),
        );
      }
      if (template.id.startsWith("third-lessons-")) {
        events.push(...grantPrimerInk(character, 5, runtime));
      }
      const nextWatch = WREN_CHAIN_NEXT[template.id];
      if (nextWatch) {
        events.push(...startQuest(world, character.id, nextWatch, runtime));
      }
    } else {
      events.push(questUpdatedEvent(character.id, template, progress, runtime));
    }
  }
  return events;
}

function awardQuestReward(
  world: WorldState,
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
    applyLevelVitals(character, { healGain: true });
    events.push(levelEvent(character, runtime));
    events.push(...maybeOpenWorldPrimer(world, character, previousLevel, nextLevel, runtime));
  }
  events.push(...grantQuestItem(world, character, template, progress, runtime));
  return events;
}

/** H1. The first tagged objective a Collegian finishes is the ending they get. */
function reachedOutcome(template: QuestTemplate, progress: QuestProgress): string | undefined {
  if (!template.outcomes?.length) {
    return undefined;
  }
  for (const id of progress.completedObjectiveIds) {
    const objective = template.objectives.find((candidate) => candidate.id === id);
    if (objective?.outcome) {
      return objective.outcome;
    }
  }
  return undefined;
}

function chosenOutcome(
  template: QuestTemplate,
  progress: QuestProgress | undefined,
): QuestOutcome | undefined {
  const id = progress?.outcome;
  return id ? template.outcomes?.find((outcome) => outcome.id === id) : undefined;
}

function grantQuestItem(
  world: WorldState,
  character: Character,
  template: QuestTemplate,
  progress: QuestProgress,
  runtime: EngineRuntime,
): EventEnvelope[] {
  const templateId =
    chosenOutcome(template, progress)?.itemRewardTemplateId ?? template.itemRewardTemplateId;
  if (!templateId) {
    return [];
  }
  const itemTemplate = world.itemTemplates?.[templateId];
  if (!itemTemplate) {
    return [];
  }
  const instanceId = `item-quest-${template.id}-loot-${templateId}--${character.id}`;
  if (worldItems(world)[instanceId]) {
    return [];
  }
  worldItems(world)[instanceId] = {
    id: instanceId,
    templateId: itemTemplate.id,
    name: itemTemplate.name,
    examineDescription: itemTemplate.examineDescription,
    roomId: character.roomId,
    holderCharacterId: character.id,
    availableToCharacterId: character.id,
    category: itemTemplate.category,
    itemType: itemTemplate.itemType,
    equipSlot: itemTemplate.equipSlot,
  };
  return [systemNotice(character.id, `You receive ${itemTemplate.name}.`, runtime)];
}

function objectiveMatches(
  world: WorldState,
  character: Character,
  template: QuestTemplate,
  objective: QuestObjective,
  trigger: QuestTrigger,
): boolean {
  const { kind } = trigger;
  if (
    template.id.startsWith("third-lessons-") &&
    objective.kind === "talk" &&
    objective.targetId === HEADMASTER_NPC_ID &&
    world.quests?.[character.id]?.[STILL_SLEEPS_QUEST_ID]?.status !== "completed"
  ) {
    return false;
  }
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
  // ADR-0047. Wearing a named piece can be the thing a story asks for.
  if (objective.kind === "equip") {
    return kind === "equip" && wearsTemplate(world, character, objective.itemTemplateId);
  }
  if (objective.kind === "defeat") {
    return (
      kind === "defeat" && Boolean(objective.targetId) && trigger.targetId === objective.targetId
    );
  }
  if (objective.kind === "cast") {
    return (
      kind === "cast" && Boolean(objective.targetId) && trigger.targetId === objective.targetId
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
      ...(progress?.status === "completed"
        ? [
            chosenOutcome(template, progress)?.completionNarration ?? template.completionNarration,
          ].filter((line): line is string => Boolean(line))
        : []),
    ].join("\n\n"),
    payload,
  });
}

/**
 * H1. Tagged objectives are alternatives, not a checklist. A forked quest needs
 * every untagged objective plus exactly one tagged one, so the branch a Collegian
 * did not walk never counts as unfinished work.
 */
function remainingObjectives(template: QuestTemplate, progress: QuestProgress): QuestObjective[] {
  const open = template.objectives.filter(
    (objective) => !progress.completedObjectiveIds.includes(objective.id),
  );
  if (!template.outcomes?.length) {
    return open;
  }
  const shared = open.filter((objective) => !objective.outcome);
  return progress.outcome ? shared : [...shared, ...open.filter((objective) => objective.outcome)];
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
