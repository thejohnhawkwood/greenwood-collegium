import { progressQuests } from "./arrival.js";
import { applyHostileCast, applySelfCast, applySelfEffect, matchSpell } from "./combat-apply.js";
import { lockChorusMove } from "./combat-chorus.js";
import { isChorus } from "./combat-party.js";
import { activeEncounter, ensurePlayerVitals } from "./combat-state.js";
import {
  concludeRound,
  openingOnly,
  prepareEncounter,
  type CombatFailure,
  type CombatSuccess,
} from "./combat-resolve.js";
import { castFocusCost } from "./gear-help.js";
import { applyRank, canCastSpell, findKnownSpell } from "./primer.js";
import type { CastIntent, EngineRuntime, SpellTemplate, WorldState } from "./state.js";
import { systemNotice } from "./system-notice.js";

export type CastSuccess = CombatSuccess;
export type CastFailure =
  | CombatFailure
  | {
      ok: false;
      code: "missing_spell" | "unknown_spell" | "not_enough_focus" | "gift_locked";
      message: string;
    };
export type CastResult = CastSuccess | CastFailure;

export function handleCast(
  world: WorldState,
  intent: CastIntent,
  runtime: EngineRuntime,
): CastResult {
  const spellName = intent.spell.trim();
  if (!spellName) {
    return {
      ok: false,
      code: "missing_spell",
      message: "Cast which spell?",
    };
  }

  const spell = matchSpell(world, spellName);
  if (!spell) {
    return {
      ok: false,
      code: "unknown_spell",
      message: `I do not know a spell called "${spellName}."`,
    };
  }

  const character = world.characters[intent.characterId];
  if (!character) {
    return {
      ok: false,
      code: "character_not_found",
      message: `I do not recognize character "${intent.characterId}".`,
    };
  }
  if (!canCastSpell(character, spell)) {
    return {
      ok: false,
      code: "gift_locked",
      message: "That leaf is not in your Primer.",
    };
  }
  if (spell.effect === "riposte" && !character.hitThisEncounter) {
    return {
      ok: false,
      code: "gift_locked",
      message: "Riposte waits until you have been hit in this fight.",
    };
  }
  if (spell.id === "buttress" && !character.hitThisEncounter) {
    return {
      ok: false,
      code: "gift_locked",
      message: "Buttress waits until you have been struck.",
    };
  }
  const ranked = applyRank(spell, findKnownSpell(character, spell.id)?.rank ?? 1);
  ensurePlayerVitals(character);
  const focus = character.focus ?? 0;
  const alreadyFighting = Boolean(activeEncounter(world, character.id));
  const focusCost = castFocusCost(character, ranked.focusCost, alreadyFighting);
  if (focus < focusCost) {
    return {
      ok: false,
      code: "not_enough_focus",
      message: `You need ${String(focusCost)} focus to cast ${ranked.name}. You have ${String(focus)}.`,
    };
  }

  const fighting = activeEncounter(world, character.id);
  if (ranked.context === "encounter" && ranked.targetType === "self" && !fighting) {
    return {
      ok: false,
      code: "missing_target",
      message: `${ranked.name} is for a fight.`,
    };
  }

  if (ranked.targetType === "self" || ((ranked.damage ?? 0) === 0 && ranked.effect)) {
    if (fighting && isChorus(fighting)) {
      return lockChorusMove(
        world,
        character,
        fighting,
        { verb: "cast", spell: ranked.id },
        runtime,
      );
    }
    if (fighting) {
      return withCastProgress(
        world,
        character.id,
        ranked,
        concludeRound(
          world,
          character,
          fighting,
          applySelfCast(character, ranked, runtime, world),
          runtime,
        ),
        runtime,
      );
    }
    const note = applySelfEffect(character, ranked, world);
    character.focus = focus - ranked.focusCost;
    return withCastProgress(
      world,
      character.id,
      ranked,
      {
        ok: true,
        events: [systemNotice(character.id, note ?? `You cast ${ranked.name}.`, runtime)],
        notices: [],
        outcome: "ongoing",
        roomId: character.roomId,
      },
      runtime,
    );
  }

  const prepared = prepareEncounter(
    world,
    intent.characterId,
    intent.target,
    runtime,
    `Cast ${ranked.name} at whom?`,
  );
  if (!prepared.ok) {
    return prepared;
  }

  const { encounter } = prepared;
  if (prepared.started) {
    return openingOnly(world, character, encounter, runtime);
  }
  if (isChorus(encounter)) {
    return lockChorusMove(world, character, encounter, { verb: "cast", spell: ranked.id }, runtime);
  }
  return withCastProgress(
    world,
    character.id,
    ranked,
    concludeRound(
      world,
      character,
      encounter,
      applyHostileCast(character, encounter, ranked, runtime, world),
      runtime,
    ),
    runtime,
  );
}

function withCastProgress(
  world: WorldState,
  characterId: string,
  spell: SpellTemplate,
  result: CastResult,
  runtime: EngineRuntime,
): CastResult {
  if (!result.ok) {
    return result;
  }
  result.events.push(
    ...progressQuests(world, { characterId, kind: "cast", targetId: spell.id }, runtime),
  );
  return result;
}
