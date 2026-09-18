import type { Character, EnemySpawn, WorldState } from "./state.js";

export function worldEnemies(world: WorldState): Record<string, EnemySpawn> {
  if (!world.enemies) {
    world.enemies = {};
  }
  return world.enemies;
}

export function hasDefeatedSpawn(character: Character | undefined, spawnId: string): boolean {
  return Boolean(character?.defeatedSpawnIds?.includes(spawnId));
}

export function recordSpawnDefeat(character: Character, spawnId: string): void {
  if (hasDefeatedSpawn(character, spawnId)) {
    return;
  }
  character.defeatedSpawnIds = [...(character.defeatedSpawnIds ?? []), spawnId];
}

export function spawnVisibleTo(world: WorldState, spawn: EnemySpawn, looker: Character): boolean {
  if (spawn.templateId === "practice-dummy") {
    return true;
  }
  if ((spawn.minParty ?? 1) > 1) {
    return Object.values(world.characters).some(
      (member) => member.roomId === spawn.roomId && !hasDefeatedSpawn(member, spawn.id),
    );
  }
  return !hasDefeatedSpawn(looker, spawn.id);
}

export function enemiesInRoom(world: WorldState, roomId: string, looker: Character): EnemySpawn[] {
  return Object.values(worldEnemies(world)).filter(
    (enemy) => enemy.roomId === roomId && spawnVisibleTo(world, enemy, looker),
  );
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
