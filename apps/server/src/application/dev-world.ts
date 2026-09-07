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
        },
      ]),
    ),
    enemies: Object.fromEntries(
      Object.values(loaded.enemies).map((enemy) => [
        enemy.id,
        {
          id: enemy.id,
          templateId: enemy.templateId,
          name: enemy.name,
          examineDescription: enemy.examineDescription,
          roomId: enemy.roomId,
          maxHealth: enemy.maxHealth,
          attack: enemy.attack,
          experience: enemy.experience,
        },
      ]),
    ),
  };
}
