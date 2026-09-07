import type { EnemyPlacement, EnemyTemplate } from "./enemy-schema.js";
import type { ItemPlacement, ItemTemplate } from "./item-schema.js";
import type { RoomFile } from "./schema.js";

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

export type LoadedWorld = {
  rooms: Record<string, LoadedRoom>;
  characters: Record<string, never>;
  items: Record<string, LoadedItem>;
  enemies: Record<string, LoadedEnemy>;
};

export function toWorldState(
  rooms: RoomFile[],
  catalog: {
    templates: ItemTemplate[];
    placements: ItemPlacement[];
    enemies?: EnemyTemplate[];
    enemyPlacements?: EnemyPlacement[];
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
  return {
    rooms: loaded,
    characters: {},
    items,
    enemies,
  };
}
