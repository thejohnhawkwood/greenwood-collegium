import { applyAttackHit } from "./combat-apply.js";
import { lockChorusMove } from "./combat-chorus.js";
import { isChorus } from "./combat-party.js";
import { ensurePlayerVitals } from "./combat-state.js";
import {
  concludeRound,
  openingOnly,
  prepareEncounter,
  type CombatEvent,
  type CombatFailure,
  type CombatSuccess,
} from "./combat-resolve.js";
import type { AttackIntent, EngineRuntime, WorldState } from "./state.js";

export type AttackEvent = CombatEvent;
export type AttackSuccess = CombatSuccess;
export type AttackFailure = CombatFailure;
export type AttackResult = AttackSuccess | AttackFailure;

export function handleAttack(
  world: WorldState,
  intent: AttackIntent,
  runtime: EngineRuntime,
): AttackResult {
  const prepared = prepareEncounter(world, intent.characterId, intent.target, runtime);
  if (!prepared.ok) {
    return prepared;
  }

  const { character, encounter } = prepared;
  ensurePlayerVitals(character);
  if (prepared.started) {
    return openingOnly(world, character, encounter, runtime);
  }
  if (isChorus(encounter)) {
    return lockChorusMove(world, character, encounter, { verb: "attack" }, runtime);
  }
  return concludeRound(
    world,
    character,
    encounter,
    applyAttackHit(world, character, encounter, runtime),
    runtime,
  );
}
