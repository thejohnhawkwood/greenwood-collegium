import { DEFAULT_PLAYER_MAX_HEALTH, activeEncounter, ensurePlayerVitals } from "./combat-state.js";
import {
  actionEvent,
  concludeRound,
  type CombatFailure,
  type CombatSuccess,
} from "./combat-resolve.js";
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
  character.defending = true;
  return concludeRound(
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
          verb: "defend",
          targetId: character.id,
          targetName: character.name,
          damage: 0,
          targetHealth: character.health ?? DEFAULT_PLAYER_MAX_HEALTH,
          targetMaxHealth: character.maxHealth ?? DEFAULT_PLAYER_MAX_HEALTH,
        },
        runtime,
        character.id,
      ),
    ],
    runtime,
  );
}
