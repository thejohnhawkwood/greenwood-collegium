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

export type LoadedWorld = {
  rooms: Record<string, LoadedRoom>;
  characters: Record<string, never>;
  items: Record<string, LoadedItem>;
};

export function toWorldState(
  rooms: RoomFile[],
  catalog: { templates: ItemTemplate[]; placements: ItemPlacement[] } = {
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
  return {
    rooms: loaded,
    characters: {},
    items,
  };
}
