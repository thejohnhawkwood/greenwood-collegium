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

export type LoadedWorld = {
  rooms: Record<string, LoadedRoom>;
  characters: Record<string, never>;
};

export function toWorldState(rooms: RoomFile[]): LoadedWorld {
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
  return {
    rooms: loaded,
    characters: {},
  };
}
