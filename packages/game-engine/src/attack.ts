import {
  DEFAULT_PLAYER_ATTACK,
  ensurePlayerVitals,
  nextRoll,
  rollAttackDamage,
} from "./combat-state.js";
import {
  actionEvent,
  concludeRound,
  openingEvents,
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
  const events: CombatEvent[] = prepared.started
    ? openingEvents(character, encounter, runtime)
    : [];
  const playerDamage = rollAttackDamage(DEFAULT_PLAYER_ATTACK, nextRoll(runtime));
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
