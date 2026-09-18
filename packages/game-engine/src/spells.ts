import type { EventEnvelope } from "@greenwood/contracts";
import type { EngineRuntime, SpellTemplate, SpellsIntent, WorldState } from "./state.js";
import { schoolKit } from "./schools.js";
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

  const known = knownSpells(world, character.id);
  if (known.length === 0) {
    return {
      ok: true,
      event: systemNotice(
        character.id,
        "You have not been taught a spell yet. Ember waits in the orchard.",
        runtime,
      ),
    };
  }
  const lines = ["You know these spells:", ...known.map((spell) => `  ${spell.helpText}`)];
  return { ok: true, event: systemNotice(character.id, lines.join("\n"), runtime) };
}

function knownSpells(world: WorldState, characterId: string): SpellTemplate[] {
  const character = world.characters[characterId];
  if (!character) {
    return [];
  }
  const ember = world.spells?.ember;
  const kit = schoolKit(world, character);
  const seen = new Set<string>();
  const listed: SpellTemplate[] = [];
  for (const spell of ember ? [ember, ...kit] : kit) {
    if (seen.has(spell.id)) {
      continue;
    }
    seen.add(spell.id);
    listed.push(spell);
  }
  return listed;
}
