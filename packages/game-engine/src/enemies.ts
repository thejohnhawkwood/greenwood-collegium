import type { EnemySpawn, WorldState } from "./state.js";

export function worldEnemies(world: WorldState): Record<string, EnemySpawn> {
  if (!world.enemies) {
    world.enemies = {};
  }
  return world.enemies;
}

export function enemiesInRoom(world: WorldState, roomId: string): EnemySpawn[] {
  return Object.values(worldEnemies(world)).filter((enemy) => enemy.roomId === roomId);
}

export function matchEnemies(candidates: readonly EnemySpawn[], target: string): EnemySpawn[] {
  const needle = target.trim().toLowerCase();
  if (needle.length === 0) {
    return [];
  }
  return candidates.filter((enemy) => {
    const name = enemy.name.toLowerCase();
    return (
      enemy.id === needle || enemy.templateId === needle || name === needle || name.includes(needle)
    );
  });
}
