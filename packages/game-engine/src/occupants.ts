import type { Character, WorldState } from "./state.js";

export function charactersInRoom(
  world: WorldState,
  roomId: string,
  exceptCharacterId?: string,
): Character[] {
  return Object.values(world.characters).filter(
    (character) => character.roomId === roomId && character.id !== exceptCharacterId,
  );
}
