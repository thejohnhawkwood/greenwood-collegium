export type RoomExit = {
  direction: string;
  toRoomId: string;
};

export type RoomFixture = {
  id: string;
  name: string;
  kind: "npc" | "object";
};

export type Room = {
  id: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  zone: string;
  exits: RoomExit[];
  fixtures: RoomFixture[];
};

export type Character = {
  id: string;
  name: string;
  roomId: string;
};

export type WorldState = {
  rooms: Record<string, Room>;
  characters: Record<string, Character>;
};

export type LookIntent = {
  verb: "look";
  characterId: string;
};

export type EngineRuntime = {
  now(): Date;
  nextEventId(): string;
  nextSequence(characterId: string): number;
};
