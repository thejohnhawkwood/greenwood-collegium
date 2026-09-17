import {
  DEFAULT_PLAYER_ATTACK,
  ensurePlayerVitals,
  nextRoll,
  rollAttackDamage,
} from "./combat-state.js";
import { attackFitModifier } from "./equipment.js";
import {
  actionEvent,
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
    return openingOnly(character, encounter, runtime);
  }
  const events: CombatEvent[] = [];
  const bonus = character.nextAttackBonus ?? 0;
  character.nextAttackBonus = undefined;
  const playerDamage = Math.max(
    1,
    rollAttackDamage(DEFAULT_PLAYER_ATTACK, nextRoll(runtime)) +
      attackFitModifier(world, character) +
      bonus,
  );
  encounter.enemy.health = Math.max(0, encounter.enemy.health - playerDamage);
  events.push(
    actionEvent(
      encounter,
      {
        encounterId: encounter.id,
        actorId: character.id,
        actorName: character.name,
        actorKind: "player",
        verb: "attack",
        targetId: encounter.enemy.id,
        targetName: encounter.enemy.name,
        damage: playerDamage,
        targetHealth: encounter.enemy.health,
        targetMaxHealth: encounter.enemy.maxHealth,
      },
      runtime,
      character.id,
    ),
  );
  return concludeRound(world, character, encounter, events, runtime);
}
