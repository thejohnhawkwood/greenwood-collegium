import { lockStillOpen } from "./combat-lock.js";
import { handleDefend, type DefendResult } from "./defend.js";
import { systemNotice } from "./system-notice.js";
import { activeEncounter } from "./combat-state.js";
import type { CombatExpireIntent, EngineRuntime, WorldState } from "./state.js";
import type { CombatFailure } from "./combat-resolve.js";

export type CombatExpireResult = DefendResult;

export function handleCombatExpire(
  world: WorldState,
  intent: CombatExpireIntent,
  runtime: EngineRuntime,
): CombatExpireResult {
  const encounter = activeEncounter(world, intent.characterId);
  if (!encounter) {
    return {
      ok: false,
      code: "not_in_combat",
      message: "The lesson has already ended.",
    };
  }
  if (lockStillOpen(encounter, runtime)) {
    return {
      ok: false,
      code: "lock_open",
      message: "The lock window is still open.",
    };
  }
  const defended = handleDefend(
    world,
    { verb: "defend", characterId: intent.characterId },
    runtime,
  );
  if (!defended.ok) {
    return defended;
  }
  return {
    ...defended,
    events: [
      systemNotice(intent.characterId, "The clock runs out. You raise a guard.", runtime),
      ...defended.events,
    ],
  };
}

export function isCombatExpireFailure(result: CombatExpireResult): result is CombatFailure {
  return !result.ok;
}
