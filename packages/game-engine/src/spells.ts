import type { EventEnvelope } from "@greenwood/contracts";
import { formatGrimoire, formatLeaf, matchPrimerLeaf } from "./primer.js";
import type { EngineRuntime, SpellsIntent, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export type SpellsSuccess = {
  ok: true;
  event: EventEnvelope;
};

export type SpellsFailure = {
  ok: false;
  code: "character_not_found";
  message: string;
};

export type SpellsResult = SpellsSuccess | SpellsFailure;

export function handleSpells(
  world: WorldState,
  intent: SpellsIntent,
  runtime: EngineRuntime,
): SpellsResult {
  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }

  const target = intent.target?.trim();
  if (target) {
    const leaf = matchPrimerLeaf(world, character, target);
    if (!leaf) {
      return {
        ok: true,
        event: systemNotice(character.id, `The Primer has no leaf named "${target}."`, runtime),
      };
    }
    return {
      ok: true,
      event: systemNotice(character.id, formatLeaf(world, character, leaf), runtime),
    };
  }

  return { ok: true, event: systemNotice(character.id, formatGrimoire(world, character), runtime) };
}
