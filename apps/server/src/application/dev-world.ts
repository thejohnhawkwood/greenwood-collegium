import { loadBundledWorld } from "@greenwood/content";
import type { WorldState } from "@greenwood/game-engine";

export function createDevWorld(): WorldState {
  const loaded = loadBundledWorld();
  return {
    rooms: loaded.rooms,
    characters: {},
    items: Object.fromEntries(
      Object.values(loaded.items).map((item) => [
        item.id,
        {
          id: item.id,
          templateId: item.templateId,
          name: item.name,
          examineDescription: item.examineDescription,
          roomId: item.roomId,
          category: item.category,
          itemType: item.itemType,
          training: item.training,
        },
      ]),
    ),
    itemTemplates: Object.fromEntries(
      Object.values(loaded.itemTemplates).map((template) => [
        template.id,
        {
          id: template.id,
          name: template.name,
          examineDescription: template.examineDescription,
          category: template.category,
          itemType: template.itemType,
          training: template.training,
        },
      ]),
    ),
    starterPlacements: loaded.starterPlacements.map((placement) => ({ ...placement })),
    enemies: Object.fromEntries(
      Object.values(loaded.enemies).map((enemy) => [
        enemy.id,
        {
          id: enemy.id,
          templateId: enemy.templateId,
          name: enemy.name,
          examineDescription: enemy.examineDescription,
          lookDescription: enemy.lookDescription,
          roomId: enemy.roomId,
          maxHealth: enemy.maxHealth,
          attack: enemy.attack,
          experience: enemy.experience,
        },
      ]),
    ),
    spells: Object.fromEntries(
      Object.values(loaded.spells).map((spell) => [
        spell.id,
        {
          id: spell.id,
          name: spell.name,
          school: spell.school,
          description: spell.description,
          focusCost: spell.focusCost,
          targetType: spell.targetType,
          context: spell.context,
          damage: spell.damage,
          burningRounds: spell.burningRounds,
          burningDamage: spell.burningDamage,
          presentationKey: spell.presentationKey,
          helpText: spell.helpText,
        },
      ]),
    ),
    questTemplates: Object.fromEntries(
      Object.values(loaded.quests).map((quest) => [
        quest.id,
        {
          id: quest.id,
          title: quest.title,
          introNarration: quest.introNarration,
          reminderNarration: quest.reminderNarration,
          giverNpcId: quest.giverNpcId,
          completionNarration: quest.completionNarration,
          experienceReward: quest.experienceReward,
          objectives: quest.objectives.map((objective) => ({ ...objective })),
        },
      ]),
    ),
    speciesProficiencies: { ...loaded.speciesProficiencies },
  };
}
