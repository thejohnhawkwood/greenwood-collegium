import type { EnemyPlacement, EnemyTemplate } from "./enemy-schema.js";
import type { ItemPlacement, ItemTemplate } from "./item-schema.js";
import type { RoomFile } from "./schema.js";
import type { SpellTemplate } from "./spell-schema.js";

export type LoadedRoom = {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  zone: string;
  exits: Array<{
    direction: string;
    toRoomId: string;
  }>;
  fixtures: Array<{
    id: string;
    name: string;
    kind: "npc" | "object";
  }>;
};

export type LoadedItem = {
  id: string;
  templateId: string;
  name: string;
  examineDescription: string;
  roomId: string;
};

export type LoadedEnemy = {
  id: string;
  templateId: string;
  name: string;
  examineDescription: string;
  roomId: string;
  maxHealth: number;
  attack: number;
  experience: number;
};

export type LoadedSpell = {
  id: string;
  name: string;
  school: string;
  description: string;
  focusCost: number;
  targetType: "enemy";
  context: "encounter";
  damage: number;
  burningRounds: number;
  burningDamage: number;
  presentationKey: string;
  helpText: string;
};

export type LoadedWorld = {
  rooms: Record<string, LoadedRoom>;
  characters: Record<string, never>;
  items: Record<string, LoadedItem>;
  enemies: Record<string, LoadedEnemy>;
  spells: Record<string, LoadedSpell>;
};

export function toWorldState(
  rooms: RoomFile[],
  catalog: {
    templates: ItemTemplate[];
    placements: ItemPlacement[];
    enemies?: EnemyTemplate[];
    enemyPlacements?: EnemyPlacement[];
    spells?: SpellTemplate[];
  } = {
    templates: [],
    placements: [],
  },
): LoadedWorld {
  const loaded: Record<string, LoadedRoom> = {};
  for (const room of rooms) {
    loaded[room.id] = {
      id: room.id,
      title: room.title,
      shortDescription: room.shortDescription,
      longDescription: room.longDescription,
      zone: room.zone,
      exits: room.exits.map((exit) => ({
        direction: exit.direction,
        toRoomId: exit.toRoomId,
      })),
      fixtures: room.fixtures.map((fixture) => ({
        id: fixture.id,
        name: fixture.name,
        kind: fixture.kind,
      })),
    };
  }
  const templates = new Map(catalog.templates.map((template) => [template.id, template]));
  const items: Record<string, LoadedItem> = {};
  for (const placement of catalog.placements) {
    const template = templates.get(placement.templateId);
    if (!template) {
      continue;
    }
    items[placement.id] = {
      id: placement.id,
      templateId: template.id,
      name: template.name,
      examineDescription: template.examineDescription,
      roomId: placement.roomId,
    };
  }
  const enemyTemplates = new Map(
    (catalog.enemies ?? []).map((template) => [template.id, template]),
  );
  const enemies: Record<string, LoadedEnemy> = {};
  for (const placement of catalog.enemyPlacements ?? []) {
    const template = enemyTemplates.get(placement.templateId);
    if (!template) {
      continue;
    }
    enemies[placement.id] = {
      id: placement.id,
      templateId: template.id,
      name: template.name,
      examineDescription: template.examineDescription,
      roomId: placement.roomId,
      maxHealth: template.maxHealth,
      attack: template.attack,
      experience: template.experience,
    };
  }
  const spells: Record<string, LoadedSpell> = {};
  for (const spell of catalog.spells ?? []) {
    spells[spell.id] = {
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
    };
  }
  return {
    rooms: loaded,
    characters: {},
    items,
    enemies,
    spells,
  };
}
