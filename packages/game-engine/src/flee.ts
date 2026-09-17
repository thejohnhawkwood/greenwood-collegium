import { applyFleeAction } from "./combat-apply.js";
import { lockChorusMove } from "./combat-chorus.js";
import { isChorus } from "./combat-party.js";
import { activeEncounter, ensurePlayerVitals } from "./combat-state.js";
import { finishFlee, type CombatFailure, type CombatSuccess } from "./combat-resolve.js";
import type { EngineRuntime, FleeIntent, WorldState } from "./state.js";

export type FleeResult = CombatSuccess | CombatFailure;

export function handleFlee(
  world: WorldState,
  intent: FleeIntent,
  runtime: EngineRuntime,
): FleeResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }
  const encounter = activeEncounter(world, character.id);
  if (!encounter) {
    return {
      ok: false,
      code: "not_in_combat",
      message: "You are not in a lesson. There is nothing to flee.",
    };
  }
  ensurePlayerVitals(character);
  if (isChorus(encounter)) {
    return lockChorusMove(world, character, encounter, { verb: "flee" }, runtime);
  }
  return finishFlee(
    world,
    character,
    encounter,
    applyFleeAction(character, encounter, runtime),
    runtime,
  );
}
