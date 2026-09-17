import { applyDefendAction } from "./combat-apply.js";
import { lockChorusMove } from "./combat-chorus.js";
import { isChorus } from "./combat-party.js";
import { activeEncounter, ensurePlayerVitals } from "./combat-state.js";
import { concludeRound, type CombatFailure, type CombatSuccess } from "./combat-resolve.js";
import type { DefendIntent, EngineRuntime, WorldState } from "./state.js";

export type DefendResult = CombatSuccess | CombatFailure;

export function handleDefend(
  world: WorldState,
  intent: DefendIntent,
  runtime: EngineRuntime,
): DefendResult {
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
      message: "You are not in a lesson. Attack a foe first.",
    };
  }
  ensurePlayerVitals(character);
  if (isChorus(encounter)) {
    return lockChorusMove(world, character, encounter, { verb: "defend" }, runtime);
  }
  return concludeRound(
    world,
    character,
    encounter,
    applyDefendAction(character, encounter, runtime),
    runtime,
  );
}
