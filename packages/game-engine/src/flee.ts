import { activeEncounter, ensurePlayerVitals } from "./combat-state.js";
import {
  actionEvent,
  finishFlee,
  type CombatFailure,
  type CombatSuccess,
} from "./combat-resolve.js";
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
  return finishFlee(
    world,
    character,
    encounter,
    [
      actionEvent(
        encounter,
        {
          encounterId: encounter.id,
          actorId: character.id,
          actorName: character.name,
          actorKind: "player",
          verb: "flee",
          targetId: encounter.enemy.id,
          targetName: encounter.enemy.name,
          damage: 0,
          targetHealth: encounter.enemy.health,
          targetMaxHealth: encounter.enemy.maxHealth,
        },
        runtime,
        character.id,
      ),
    ],
    runtime,
  );
}
