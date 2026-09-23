import { castFocusCost } from "./gear-help.js";
import { schoolKit } from "./schools.js";
import type { Character, Encounter, EnemySpawn, EngineRuntime, WorldState } from "./state.js";

export const COMBAT_LOCK_MS = 12_000;
export const DEFAULT_ENEMY_MAX_FOCUS = 6;

export type CombatMoveKind = "attack" | "cast" | "defend" | "flee";

export type CombatMove = {
  label: string;
  command: string;
  kind: CombatMoveKind;
};

export function beginLockWindow(encounter: Encounter, runtime: EngineRuntime): void {
  encounter.status = "awaiting_intents";
  encounter.lockDeadlineAt = new Date(runtime.now().getTime() + COMBAT_LOCK_MS).toISOString();
}

export function lockStillOpen(encounter: Encounter, runtime: EngineRuntime): boolean {
  return runtime.now().getTime() < Date.parse(encounter.lockDeadlineAt);
}

export function enemyFocusFromSpawn(spawn: EnemySpawn): { focus: number; maxFocus: number } {
  const maxFocus = spawn.maxFocus ?? DEFAULT_ENEMY_MAX_FOCUS;
  return { focus: maxFocus, maxFocus };
}

export function combatMoves(world: WorldState, character: Character): CombatMove[] {
  const kit = schoolKit(world, character);
  const ember = world.spells?.ember;
  const spells = kit.length > 0 ? kit : ember ? [ember] : [];
  const focus = character.focus ?? 0;
  const casts = spells.flatMap((spell) => {
    if (castFocusCost(character, spell.focusCost, true) > focus) {
      return [];
    }
    if (spell.effect === "riposte" && !character.hitThisEncounter) {
      return [];
    }
    return [
      {
        label: spell.name,
        command: `cast ${spell.id}`,
        kind: "cast" as const,
      },
    ];
  });
  return [
    { label: "Attack", command: "attack", kind: "attack" },
    ...casts,
    { label: "Defend", command: "defend", kind: "defend" },
    { label: "Flee", command: "flee", kind: "flee" },
  ];
}
